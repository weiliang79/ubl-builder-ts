import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { loadSchema, Schema, SchemaChild, SchemaType } from './schema';

/**
 * Adds the elements the fork never transcribed.
 *
 * Every addition is optional in UBL and unset by default, so nothing that
 * serializes today changes. The point is to stop the next person hand-editing
 * a params map: commit bcd788b did exactly that and introduced a wrong
 * classRef in the process.
 *
 * Children whose type has no component class yet are skipped and reported —
 * that gap needs new files, which is a larger job than this one.
 */

const CAC_DIR = join(__dirname, '..', '..', 'src', 'cac');

const local = (name: string) => name.trim().split(':').pop() as string;
const camel = (name: string) => name.charAt(0).toLowerCase() + name.slice(1);

/** Match the dominant convention: repeating elements get a plural key. */
function pluralize(word: string): string {
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  return `${word}s`;
}

/** `udt:IdentifierType` -> `UdtIdentifier`. */
function udtClass(type: string): string {
  return `Udt${local(type).replace(/Type$/, '')}`;
}

/**
 * Map each schema type to the class that implements it.
 *
 * Keyed by type rather than by element name: a type is often reachable through
 * an element no existing map happens to use — cac:CountryType via
 * cac:OriginCountry, say — and keying by element would miss those.
 */
function learnByType(
  files: string[],
  schema: Schema,
): Map<string, { classRef: string; declared: string; module: string }> {
  const learned = new Map<string, { classRef: string; declared: string; module: string }>();

  files.forEach((file) => {
    const stem = basename(file, '.ts');
    const type = schemaTypeFor(stem, schema);
    if (!type) return;
    const key = schema.elements.get(`cac:${stem}`) ?? `cac:${type.name}`;
    const source = readFileSync(join(CAC_DIR, file), 'utf8');

    // The importable name is the *exported* one, which is often an alias:
    // TaxTotal.ts declares TaxTotalType and exports it as TaxTotal, and
    // Location.ts exports LocationType under four different names.
    const declared = [...source.matchAll(/^(?:export )?class (\w+)/gm)].map((m) => m[1]);
    const aliases = new Map<string, string[]>();
    [...source.matchAll(/export \{([^}]+)\}/g)].forEach((block) =>
      block[1].split(',').forEach((part) => {
        const [from, to] = part.split(/\s+as\s+/).map((x) => x.trim());
        if (!from) return;
        aliases.set(from, [...(aliases.get(from) ?? []), to ?? from]);
      }),
    );

    const primary = declared.find((c) => c === stem) ?? declared[0];
    if (!primary) return;
    const names = aliases.get(primary) ?? [primary];
    // prefer the alias matching the file name, so imports read predictably
    const classRef = names.find((n) => n === stem) ?? names[0];
    // `declared` is the name the class statement actually binds. It differs
    // from classRef whenever a file exports under an alias — Location.ts
    // declares LocationType and exports it as AlternativeDeliveryLocation —
    // and a same-file reference must use the binding, not the export name.
    learned.set(key, { classRef, declared: primary, module: file });
  });

  // Fall back to whatever existing maps already do — but only to *live* ones.
  //
  // Scanning the raw source also matched commented-out entries, which are
  // plentiful here and frequently wrong: it learned cac:BillingReferenceLine
  // and cac:DiscrepancyResponse as `null`, cac:SubDebitNoteLine as `undefined`,
  // and cac:OtherCommunication as UdtIdentifier. Nothing has emitted from those
  // yet only because `present` scrapes commented-out attributeNames too and
  // masks them; the first child that slips past would emit `classRef: null` and
  // `import { null } from './BillingReference'`.
  //
  // So comments are stripped first, and a classRef is only believed if it looks
  // like a class and the module it came from actually exports it.
  files.forEach((file) => {
    const raw = readFileSync(join(CAC_DIR, file), 'utf8');
    const source = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((line) => !/^\s*\/\//.test(line))
      .join('\n');
    for (const m of source.matchAll(/attributeName:\s*'(cac:[^']+)',[^}]*?classRef:\s*(?:\(\) =>\s*)?(\w+)/g)) {
      const type = schema.elements.get(m[1]);
      const ref = m[2];
      if (!type || learned.has(type)) continue;
      // `classRef: null` is a deliberate placeholder in a few maps for types
      // with no component class yet; it is not a name to learn.
      if (!/^[A-Z]\w*$/.test(ref)) continue;
      // The module recorded here becomes an import path later, so the name has
      // to actually be a binding in this file — declared here or imported.
      if (!declaredIn(source).has(ref) && !importsOf(source).has(ref)) continue;
      learned.set(type, { classRef: ref, declared: ref, module: file });
    }
  });

  return learned;
}

/** Class names this file declares itself. */
function declaredIn(source: string): Set<string> {
  return new Set([...source.matchAll(/^(?:export )?(?:default )?(?:abstract )?class (\w+)/gm)].map((m) => m[1]));
}

/** Where a symbol is imported from, if the file already imports it. */
function importsOf(source: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const m of source.matchAll(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+'([^']+)';/g)) {
    m[1]
      .split(',')
      .map((s) =>
        s
          .trim()
          .split(/\s+as\s+/)[0]
          .trim(),
      )
      .filter(Boolean)
      .forEach((symbol) => found.set(symbol, m[2]));
  }
  return found;
}

function schemaTypeFor(stem: string, schema: Schema): SchemaType | undefined {
  const viaElement = schema.elements.get(`cac:${stem}`);
  return (
    (viaElement ? schema.types.get(viaElement) : undefined) ??
    schema.types.get(`cac:${stem}Type`) ??
    schema.types.get(`doc:${stem}Type`)
  );
}

interface Addition {
  key: string;
  child: SchemaChild;
  classRef: string;
  from: string | null; // module to import from, null if already imported
  tsType: string;
  lazy: boolean; // emit `() => X` because X is declared below the params map
}

function main(): void {
  const schema = loadSchema();
  const write = !process.argv.includes('--check');
  const files = readdirSync(CAC_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
  const learned = learnByType(files, schema);

  let added = 0;
  let changedFiles = 0;
  const unresolved = new Map<string, number>();

  files.forEach((file) => {
    const path = join(CAC_DIR, file);
    let source = readFileSync(path, 'utf8');
    const type = schemaTypeFor(basename(file, '.ts'), schema);
    if (!type) return;

    const mapOpen = /const ParamsMap[^=]*=\s*\{/.exec(source);
    const paramsOpen = /type AllowedParams\s*=\s*\{/.exec(source);
    if (!mapOpen || !paramsOpen) return;

    const present = new Set([...source.matchAll(/attributeName:\s*'([^']*)'/g)].map((m) => m[1]));
    const existingImports = importsOf(source);
    const usedKeys = new Set([...source.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]));

    const additions: Addition[] = [];
    type.children.forEach((child) => {
      if (present.has(child.name)) return;

      // A self-referential child names the very class the params map sits above
      // — cac:AgentParty inside PartyType. Referring to it eagerly would read
      // the binding before the class statement initialises it, so these are
      // emitted as `() => X` and resolved on first use by resolveClassRef.
      // The mechanism already exists and is used for cross-file cycles; this
      // only stops the generator declining to reach for it.
      const isSelfReferential =
        child.type === schema.elements.get(`cac:${basename(file, '.ts')}`) || child.type === `cac:${type.name}`;

      const repeats = child.maxOccurs === null;
      let classRef: string;
      let from: string | null = null;
      let tsType: string;

      if (child.type.startsWith('udt:')) {
        classRef = udtClass(child.type);
        tsType = `string | ${classRef}`;
        if (!existingImports.has(classRef)) from = '../datatypes/udt';
      } else {
        const known = learned.get(child.type);
        if (!known) {
          unresolved.set(child.type, (unresolved.get(child.type) ?? 0) + 1);
          return;
        }
        // Cross-file references import the exported name; a self-reference is
        // resolved in this module's own scope, where only the declared name
        // exists. Using the export alias there is a ReferenceError at first use.
        classRef = isSelfReferential ? known.declared : known.classRef;
        tsType = classRef;
        if (!existingImports.has(classRef)) from = `./${basename(known.module, '.ts')}`;
        if (from === `./${basename(file, '.ts')}`) from = null; // defined in this file
      }

      let key = camel(local(child.name));
      if (repeats) key = pluralize(key);
      if (usedKeys.has(key)) return; // a differently-named entry already covers it
      usedKeys.add(key);

      additions.push({ key, child, classRef, from, tsType: repeats ? `${tsType}[]` : tsType, lazy: isSelfReferential });
    });

    if (additions.length === 0) return;

    // params map entries, appended; `order` is renumbered wholesale afterwards
    const mapEntries = additions
      .map(
        (a) =>
          `  ${a.key}: { order: ${type.children.indexOf(a.child) + 1}, attributeName: '${a.child.name}', ` +
          `max: ${a.child.maxOccurs === null ? 'undefined' : a.child.maxOccurs}, ` +
          `classRef: ${a.lazy ? `() => ${a.classRef}` : a.classRef} },`,
      )
      .join('\n');

    const paramFields = additions.map((a) => `  /** ${a.child.definition} */\n  ${a.key}?: ${a.tsType};`).join('\n');

    source = `${source.slice(0, mapOpen.index! + mapOpen[0].length)}\n${mapEntries}${source.slice(
      mapOpen.index! + mapOpen[0].length,
    )}`;

    const reopened = /type AllowedParams\s*=\s*\{/.exec(source)!;
    source = `${source.slice(0, reopened.index! + reopened[0].length)}\n${paramFields}${source.slice(
      reopened.index! + reopened[0].length,
    )}`;

    // add any imports the new entries need
    const byModule = new Map<string, string[]>();
    additions
      .filter((a) => a.from)
      .forEach((a) => byModule.set(a.from!, [...(byModule.get(a.from!) ?? []), a.classRef]));
    byModule.forEach((symbols, module) => {
      const unique = [...new Set(symbols)].sort();
      const existing = new RegExp(`import \\{([^}]+)\\} from '${module.replace('.', '\\.')}';`).exec(source);
      if (existing) {
        const merged = [...new Set([...existing[1].split(',').map((s) => s.trim()), ...unique])].filter(Boolean).sort();
        source = source.replace(existing[0], `import { ${merged.join(', ')} } from '${module}';`);
      } else {
        source = `import { ${unique.join(', ')} } from '${module}';\n${source}`;
      }
    });

    added += additions.length;
    changedFiles += 1;
    console.log(`\n${file}  +${additions.length}`);
    additions.slice(0, 5).forEach((a) => console.log(`    ${a.key}: ${a.child.name} (${a.classRef})`));
    if (additions.length > 5) console.log(`    … and ${additions.length - 5} more`);

    if (write) writeFileSync(path, source);
  });

  console.log(`\n${'='.repeat(64)}`);
  console.log(`${write ? 'added' : 'would add'} ${added} elements across ${changedFiles} files`);
  if (unresolved.size) {
    const total = [...unresolved.values()].reduce((a, b) => a + b, 0);
    console.log(`\nskipped ${total} children needing ${unresolved.size} component types that do not exist yet:`);
    [...unresolved.entries()].sort((a, b) => b[1] - a[1]).forEach(([t, n]) => console.log(`  ${t} (${n})`));
  }
}

main();
