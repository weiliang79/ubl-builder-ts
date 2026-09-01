import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { CAC_DIR, learnByType, schemaTypeFor, udtClass } from './components';
import { loadSchema } from './schema';
import { blankComments, bodyBounds } from './source';

/**
 * Every `classRef` must name the class that implements the child's schema type.
 *
 * The last dimension of a params-map entry nothing compared. check:schema holds
 * the element name, sequence position and cardinality to the OASIS schemas, and
 * check:types holds the declared TypeScript field to the map beside it — but
 * the classRef, which decides what a raw string gets wrapped in, was checked by
 * nobody.
 *
 * Both shapes it goes wrong in are real, and the second is not cosmetic.
 *
 * An aggregate wired to a datatype builds the wrong kind of object out of the
 * value and loses it: Delivery.deliveryTerms named UdtDate for
 * cac:DeliveryTerms and emitted <cac:DeliveryTerms></…> with the children gone.
 *
 * Two datatypes confused for each other keep the text and change the legal
 * attribute set. multiplierFactorNumeric was UdtAmount against a NumericType,
 * so code with no casts in it could attach a currencyID and produce an invoice
 * xmllint rejects — "attribute 'currencyID' is not allowed". This was filed as
 * cosmetic until someone ran the XSD over it.
 */

const schema = loadSchema();
const learned = learnByType(
  readdirSync(CAC_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts'),
  schema,
);

type Severity = 'drops content' | 'forbidden attribute';

interface Problem {
  file: string;
  key: string;
  element: string;
  declared: string;
  expected: string;
  severity: Severity;
}

const problems: Problem[] = [];
const uncomparable: string[] = [];
const docProblems: string[] = [];
let compared = 0;
let docCompared = 0;

/**
 * Every name that implements each schema type.
 *
 * One class routinely serves several elements under several export aliases —
 * DocumentReference.ts declares eight classes over one params map, Party.ts
 * exports one class as Party, NotifyParty, CarrierParty and IssuerParty — so
 * "the" class for a type is the wrong question. The right one is whether the
 * name in the map is *one of* the names implementing that type.
 *
 * Each class says what it serves in its own `super(content, ParamsMap, '…')`
 * argument, which is sometimes an element name and sometimes a type name.
 * Falling back to the file stem covers the few that pass neither.
 */
function buildImplementers(): Map<string, Set<string>> {
  const byType = new Map<string, Set<string>>();
  const add = (type: string | undefined, name: string) => {
    if (!type) return;
    if (!byType.has(type)) byType.set(type, new Set());
    byType.get(type)!.add(name);
  };

  readdirSync(CAC_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .forEach((file) => {
      const source = blankComments(readFileSync(join(CAC_DIR, file), 'utf8'));
      const fallback = schemaTypeFor(file.replace(/\.ts$/, ''), schema);
      const typeOfClass = new Map<string, string>();

      // Walked class by class rather than matched with one lazy `[\s\S]*?`
      // spanning both. A class whose super() does not match the shape below
      // would let the lazy version run on and pair it with the *next* class's
      // element. Every class in src/cac has its own today, so nothing is
      // mispaired — but an unbounded lazy match is how the arity gate came to
      // read the next entry's `max` and how a field rewrite came to delete a
      // params map, and neither of those was firing until it was.
      const heads = [...source.matchAll(/class\s+(\w+)\s+extends\s+GenericAggregateComponent/g)];
      for (let i = 0; i < heads.length; i += 1) {
        const upTo = i + 1 < heads.length ? heads[i + 1].index! : source.length;
        const inClass = source.slice(heads[i].index!, upTo);
        const sup = /super\(\s*content\s*,\s*\w+\s*,\s*'([^']*)'/.exec(inClass);
        if (!sup) continue;
        const cls = heads[i][1];
        const serves = sup[1];
        // The argument is an element name in most files and a type name in a
        // few — `super(content, ParamsMap, 'cac:AddressType')`. Try both.
        const type = schema.elements.get(serves) ?? (schema.types.has(serves) ? serves : undefined);
        const resolved = type ?? (fallback ? `cac:${fallback.name}` : undefined);
        if (resolved) typeOfClass.set(cls, resolved);
        add(resolved, cls);
      }

      // An export alias is the same class under another name, so it implements
      // whatever that class does.
      for (const block of source.matchAll(/export \{([^}]+)\}/g)) {
        for (const part of block[1].split(',')) {
          const [from, to] = part.split(/\s+as\s+/).map((x) => x.trim());
          if (!from || !to) continue;
          add(typeOfClass.get(from), to);
        }
      }
    });

  return byType;
}

const implementers = buildImplementers();

/**
 * `class X extends Y` across the datatype and component trees.
 *
 * A specialisation is still the type it specialises. `cbc:UBLVersionID` is
 * `udt:IdentifierType` in the schema, and this library gives it its own class
 * — `UBLVersionID extends UdtIdentifier` — because the cbc schema declares
 * UBLVersionIDType as an extension of it. Comparing names alone reports that as
 * a defect, which it is not.
 */
function buildSuperclasses(): Map<string, string> {
  const chain = new Map<string, string>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.ts')) {
        const text = blankComments(readFileSync(full, 'utf8'));
        for (const m of text.matchAll(/class\s+(\w+)\s+extends\s+(\w+)/g)) chain.set(m[1], m[2]);
      }
    }
  };
  walk(join(__dirname, '..', '..', 'src'));
  return chain;
}

const superclassOf = buildSuperclasses();

/** `declared`, or anything it extends, appears in `expected`. */
function satisfies(declared: string, expected: string[]): boolean {
  const seen = new Set<string>();
  for (let name: string | undefined = declared; name && !seen.has(name); name = superclassOf.get(name)) {
    if (expected.includes(name)) return true;
    seen.add(name);
  }
  return false;
}

/** Every name the class implementing `type` is reachable by. */
function namesFor(type: string): string[] | null {
  if (type.startsWith('udt:')) return [udtClass(type)];
  const fromSource = implementers.get(type);
  if (fromSource?.size) return [...fromSource];
  const known = learned.get(type);
  return known ? [...new Set([known.classRef, known.declared, ...known.aliases])] : null;
}

readdirSync(CAC_DIR)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .forEach((file) => {
    const source = blankComments(readFileSync(join(CAC_DIR, file), 'utf8'));
    const type = schemaTypeFor(file.replace(/\.ts$/, ''), schema);
    if (!type) return;
    const bounds = bodyBounds(source, /const ParamsMap[^=]*=\s*\{/);
    if (!bounds) return;
    const mapBody = source.slice(bounds.start, bounds.end);

    for (const m of mapBody.matchAll(/^\s{2}(\w+):\s*\{((?:[^{}]|\{[^{}]*\})*)\}/gm)) {
      const [, key, entry] = m;
      const element = /attributeName:\s*'([^']*)'/.exec(entry)?.[1];
      const declared = /classRef:\s*(?:\(\)\s*=>\s*)?([A-Za-z_]\w*)/.exec(entry)?.[1];
      if (!element || !declared) continue;

      const child = type.children.find((c) => c.name === element);
      if (!child) continue; // check:schema owns elements that are not in the type

      const expected = namesFor(child.type);
      if (!expected) {
        // No component class exists for this type yet — BillingReferenceLine
        // carries `classRef: null` as a deliberate placeholder for exactly
        // that. Counted rather than passed over in silence, so the compared
        // total reconciles against the 519 entries in src/cac.
        uncomparable.push(`${file.replace(/\.ts$/, '')}.${key} (${child.type} has no class)`);
        continue;
      }
      compared += 1;
      if (satisfies(declared, expected)) continue;

      // An aggregate wired to a datatype, or the reverse, builds the wrong kind
      // of object out of the value and loses it: Delivery.deliveryTerms names
      // UdtDate for cac:DeliveryTerms and emits an empty element. Two datatypes
      // confused for each other keep the text but carry the wrong attribute
      // set, which is how multiplierFactorNumeric — declared UdtAmount against
      // a NumericType — lets code with no casts in it attach a currencyID that
      // the XSD rejects.
      const bothDatatypes = child.type.startsWith('udt:') && declared.startsWith('Udt');
      problems.push({
        file,
        key,
        element,
        declared,
        expected: expected[0],
        severity: bothDatatypes ? 'forbidden attribute' : 'drops content',
      });
    }
  });

// One file per schema type.
//
// Address.ts and PostalAddress.ts both implemented cac:AddressType, and no gate
// could see it: each is compared to the schema on its own, so two copies stay
// valid while drifting from each other. They had, on four classRefs, and the
// agreement they ended up in was restored by hand rather than enforced. A
// second implementation is not a defect the other checks can express, so it is
// refused outright.
const filesByType = new Map<string, string[]>();
readdirSync(CAC_DIR)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .forEach((file) => {
    const type = schemaTypeFor(file.replace(/\.ts$/, ''), schema);
    if (!type) return;
    const key = `cac:${type.name}`;
    filesByType.set(key, [...(filesByType.get(key) ?? []), file]);
  });
const duplicated = [...filesByType.entries()].filter(([, files]) => files.length > 1);

// The document map, which nothing has ever gated. It is not a params map and
// Invoice is not a GenericAggregateComponent, so check:schema and check:types
// both pass over it — and it decides the element name, sequence position,
// cardinality and class of all 54 children of an invoice.
const DOC_DIR = join(__dirname, '..', '..', 'src', 'documents');
const docSource = blankComments(readFileSync(join(DOC_DIR, 'ChildrenMap.ts'), 'utf8'));
const docType = schema.types.get('doc:InvoiceType');
const docBounds = bodyBounds(docSource, /export const INVOICE_CHILDREN_MAP[^=]*=\s*\{/);
if (!docType || !docBounds) {
  problems.push({
    file: 'ChildrenMap.ts',
    key: '(whole map)',
    element: 'doc:InvoiceType',
    declared: '-',
    expected: 'readable',
    severity: 'drops content',
  });
} else {
  const docBody = docSource.slice(docBounds.start, docBounds.end);
  const positions = new Map(docType.children.map((c, i) => [c.name, { child: c, position: i + 1 }]));
  const covered = new Set<string>();
  const declaredRef = new Map<string, string>();

  for (const m of docBody.matchAll(/^\s{2}(\w+):\s*\{((?:[^{}]|\{[^{}]*\})*)\}/gm)) {
    const [, key, entry] = m;
    const element = /childName:\s*'([^']*)'/.exec(entry)?.[1];
    const ref = /classRef:\s*(?:\(\)\s*=>\s*)?([A-Za-z_]\w*)/.exec(entry)?.[1];
    const order = Number(/order:\s*(\d+)/.exec(entry)?.[1]);
    const max = /max:\s*(\d+)/.exec(entry)?.[1];
    if (!element || !ref) continue;

    declaredRef.set(key, ref);

    const found = positions.get(element);
    if (!found) {
      docProblems.push(`${key}: ${element} is not a child of doc:InvoiceType`);
      continue;
    }
    covered.add(element);
    if (order !== found.position) docProblems.push(`${key}: order ${order}, schema position ${found.position}`);
    const repeats = found.child.maxOccurs === null;
    if (repeats !== (max === undefined)) {
      docProblems.push(
        `${key}: max ${max ?? 'undefined'}, schema ${found.child.minOccurs}..${found.child.maxOccurs ?? '*'}`,
      );
    }
    const names = namesFor(found.child.type);
    if (names && !satisfies(ref, names))
      docProblems.push(`${key}: classRef ${ref}, schema type ${found.child.type} (${names[0]})`);
    docCompared += 1;
  }

  docType.children.filter((c) => !covered.has(c.name)).forEach((c) => docProblems.push(`(missing): ${c.name}`));

  // The forty-five setters written before the map had a classRef each restate
  // their own class, so the map is a second copy. Serialisation uses whatever
  // the setter built and the parser uses the map, which means a disagreement
  // shows up only as two paths producing different objects — the quietest kind.
  // Setters added since read the map through assignChild and have no copy to
  // disagree with, which is why they are absent here rather than unchecked.
  const invoiceSource = blankComments(readFileSync(join(DOC_DIR, 'Invoice.ts'), 'utf8'));
  const builds = new Map<string, string>();
  const note = (key: string, cls: string) => {
    if (!builds.has(key)) builds.set(key, cls);
  };
  for (const m of invoiceSource.matchAll(/this\.children\.(\w+)\s*=\s*[\s\S]{0,120}?new (\w+)\(/g)) note(m[1], m[2]);
  for (const m of invoiceSource.matchAll(/this\.children\.(\w+)\.push\(new (\w+)\(/g)) note(m[1], m[2]);
  for (const m of invoiceSource.matchAll(
    /const itemToPush =[\s\S]{0,160}?new (\w+)\([\s\S]{0,240}?this\.children\.(\w+)\.push\(itemToPush\)/g,
  )) {
    note(m[2], m[1]);
  }

  for (const [key, built] of builds) {
    const declared = declaredRef.get(key);
    if (declared && declared !== built) {
      docProblems.push(`${key}: the setter builds ${built}, the map says ${declared}`);
    }
  }
}

console.log(`compared ${compared} classRefs across ${readdirSync(CAC_DIR).length - 1} components`);
if (uncomparable.length) {
  console.log(`  ${uncomparable.length} not compared: ${uncomparable.join(', ')}`);
}
if (problems.length) {
  const drops = problems.filter((p) => p.severity === 'drops content');
  const wrappers = problems.filter((p) => p.severity === 'forbidden attribute');
  const show = (label: string, list: Problem[]) => {
    if (!list.length) return;
    console.log(`\n${label}`);
    list.forEach((p) =>
      console.log(
        `  ${p.file.replace(/\.ts$/, '').padEnd(24)} ${p.key.padEnd(28)} ${p.element.padEnd(30)} ${p.declared} -> ${p.expected}`,
      ),
    );
  };
  show('wired to the wrong kind of class — the value is built wrong and lost:', drops);
  show('wrong datatype — admits an attribute the schema forbids on that element:', wrappers);
  console.log(
    `\n${problems.length} classRef(s) disagree with the schema` +
      ` (${drops.length} lose content, ${wrappers.length} admit a forbidden attribute)`,
  );
  process.exitCode = 1;
} else {
  console.log('every classRef names the class implementing its schema type');
}

if (duplicated.length) {
  console.log(`\n${duplicated.length} schema type(s) implemented by more than one file:`);
  duplicated.forEach(([type, files]) => console.log(`  ${type}: ${files.join(', ')}`));
  process.exitCode = 1;
} else {
  console.log(`\n${filesByType.size} schema types, each implemented by exactly one file`);
}

console.log(`\ncompared ${docCompared} children of doc:InvoiceType`);
if (docProblems.length) {
  docProblems.forEach((d) => console.log(`  ChildrenMap.ts: ${d}`));
  console.log(`\n${docProblems.length} disagreement(s) between INVOICE_CHILDREN_MAP and the schema`);
  process.exitCode = 1;
} else {
  console.log('the document map agrees with doc:InvoiceType on name, order, cardinality and class');
}
