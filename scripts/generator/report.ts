import { readdirSync, readFileSync } from 'fs';
import { basename, join } from 'path';
import { loadSchema, SchemaType } from './schema';
import { blankComments } from './source';

/**
 * Compares the hand-written params maps against the OASIS schemas.
 *
 * This runs before the generator emits anything: if the parser were wrong the
 * differences would be nonsense, and if the hand-written maps were right there
 * would be nothing to report. Neither turns out to be true.
 */

const CAC_DIR = join(__dirname, '..', '..', 'src', 'cac');

interface HandEntry {
  key: string;
  elementName: string;
  max: number | null; // null = unbounded (max omitted or undefined)
}

/** Pull params-map entries out of a source file without executing it. */
function readHandMap(source: string): HandEntry[] {
  // Commented-out entries are common in these files and must not be counted.
  const live = blankComments(source);

  // Only the params map itself; AllowedParams and class bodies follow it.
  const block = /(?:const ParamsMap|const \w*CHILDREN_MAP)[^=]*=\s*\{([\s\S]*?)\n\};/.exec(live);
  if (!block) return [];

  const entries: HandEntry[] = [];
  const pattern =
    /(\w+):\s*\{[^{}]*?(?:attributeName|childName):\s*'([^']+)'(?:[^{}]*?max:\s*(\d+|undefined))?[^{}]*?\}/g;

  for (const match of block[1].matchAll(pattern)) {
    const [, key, elementName, max] = match;
    entries.push({
      key,
      elementName,
      max: max === undefined || max === 'undefined' ? null : Number(max),
    });
  }
  return entries;
}

/**
 * Tagged rather than classified by the message's first word, which is what the
 * totals used to do. That parsing failed silently: renaming one message moved
 * ten findings into the "not in the schema" bucket and every printed total was
 * wrong with nothing to indicate it.
 */
interface Problem {
  kind: 'missing' | 'max' | 'order' | 'extra';
  text: string;
}

function compare(typeName: string, schema: SchemaType, hand: HandEntry[]): Problem[] {
  const problems: Problem[] = [];
  const handByElement = new Map(hand.map((e) => [e.elementName, e]));
  const schemaNames = new Set(schema.children.map((c) => c.name));

  schema.children.forEach((child) => {
    const entry = handByElement.get(child.name);
    if (!entry) {
      problems.push({
        kind: 'missing',
        text: `missing      ${child.name} [${child.minOccurs}..${child.maxOccurs ?? '*'}]`,
      });
      return;
    }
    if (entry.max !== child.maxOccurs) {
      const show = (v: number | null) => (v === null ? 'unbounded' : String(v));
      problems.push({
        kind: 'max',
        text: `max          ${child.name}: have ${show(entry.max)}, schema ${show(child.maxOccurs)}`,
      });
    }
  });

  // Relative order only. Comparing absolute positions would report every
  // element after an unmatched one as misordered, which inflates a single
  // defect into a cascade.
  const shared = new Set(hand.map((e) => e.elementName).filter((n) => schemaNames.has(n)));
  const handOrder = hand.map((e) => e.elementName).filter((n) => shared.has(n));
  // Declaration order in the object literal, which is cosmetic: toNode() sorts
  // on the `order` field before emitting, and check:schema verifies those
  // values against the schema. It is reported because a map whose declaration
  // order disagrees with its own `order` values invites the assumption that
  // position matters — but it is not a defect, and generated additions are
  // prepended, so it grows whenever complete.ts adds an element.
  const schemaOrder = schema.children.map((c) => c.name).filter((n) => shared.has(n));
  if (handOrder.join('|') !== schemaOrder.join('|')) {
    const firstDivergence = handOrder.findIndex((n, i) => n !== schemaOrder[i]);
    problems.push({
      kind: 'order',
      text:
        `declared out of sequence at ${handOrder[firstDivergence]}; schema lists ` +
        `${schemaOrder[firstDivergence]} there (cosmetic — the \`order\` values are ` +
        `what serialise, and check:schema gates them)`,
    });
  }

  hand
    .filter((e) => !schemaNames.has(e.elementName))
    .forEach((e) => problems.push({ kind: 'extra', text: `not in schema ${e.elementName}` }));

  return problems;
}

function main(): void {
  const schema = loadSchema();
  const files = readdirSync(CAC_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts');

  let checked = 0;
  let clean = 0;
  const unmatched: string[] = [];
  const totals = { missing: 0, max: 0, order: 0, extra: 0 };

  const sources: [string, string][] = files.map((f) => [f, readFileSync(join(CAC_DIR, f), 'utf8')]);
  sources.push(['Invoice.ts', readFileSync(join(__dirname, '..', '..', 'src', 'documents', 'ChildrenMap.ts'), 'utf8')]);

  sources.forEach(([file, source]) => {
    const stem = basename(file, '.ts');
    // Prefer resolving through the element declaration: several components are
    // named for an element whose type differs — cac:PostalAddress is an
    // AddressType, cac:PayeeFinancialAccount a FinancialAccountType.
    const viaElement = schema.elements.get(`cac:${stem}`) ?? schema.elements.get(`doc:${stem}`);
    const typeName = viaElement ?? `cac:${stem}Type`;
    const schemaType =
      schema.types.get(typeName) ?? schema.types.get(`cac:${stem}Type`) ?? schema.types.get(`doc:${stem}Type`);
    const hand = readHandMap(source);

    if (!schemaType || hand.length === 0) {
      if (hand.length > 0) unmatched.push(file);
      return;
    }

    checked += 1;
    const problems = compare(typeName, schemaType, hand);
    if (problems.length === 0) {
      clean += 1;
      return;
    }

    problems.forEach((p) => {
      totals[p.kind] += 1;
    });

    console.log(`\n${file}  (${typeName})`);
    problems.slice(0, 8).forEach((p) => console.log(`    ${p.text}`));
    if (problems.length > 8) console.log(`    … and ${problems.length - 8} more`);
  });

  console.log(`\n${'='.repeat(64)}`);
  console.log(`types compared        ${checked}`);
  console.log(`matching the schema   ${clean}`);
  console.log(`with differences      ${checked - clean}`);
  console.log(`\nmissing elements      ${totals.missing}`);
  console.log(`wrong maxOccurs       ${totals.max}`);
  console.log(`declared out of order ${totals.order}  (cosmetic; see check:schema for real order defects)`);
  console.log(`not in the schema     ${totals.extra}`);
  if (unmatched.length) console.log(`\nno schema type matched: ${unmatched.join(', ')}`);
}

main();
