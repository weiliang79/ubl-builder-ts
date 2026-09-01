import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { CAC_DIR, camel, importsOf, learnByType, local, pluralize, schemaTypeFor, udtClass } from './components';
import { loadSchema, SchemaChild } from './schema';
import { ALLOWED_PARAMS_OPEN, blankComments, bodyBounds } from './source';

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

    // Every search below runs on the blanked copy and every write on the real
    // one. Blanking preserves length, so an offset found in `scan` addresses
    // the same character in `source`.
    let scan = blankComments(source);
    const mapOpen = /const ParamsMap[^=]*=\s*\{/.exec(scan);
    const paramsOpen = ALLOWED_PARAMS_OPEN.exec(scan);
    if (!mapOpen || !paramsOpen) return;

    // Comment-stripped, for the same reason the fallback loop above is: a
    // commented-out entry is not an emitted one. InvoiceLine.ts and
    // DebitNoteLine.ts each carry a commented `cac:SubInvoiceLine` /
    // `cac:SubDebitNoteLine`, which made this treat both as already present and
    // skip them — silently, since a skip for this reason is not even reported.
    const present = new Set([...scan.matchAll(/attributeName:\s*'([^']*)'/g)].map((m) => m[1]));
    // A commented-out import would otherwise make this think the symbol is
    // already imported, and the generator would emit a classRef with no import.
    const existingImports = importsOf(scan);
    // A 2-space-indented `key: {` inside a block comment would otherwise add a
    // phantom key and silently drop a real child.
    const usedKeys = new Set([...scan.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]));
    // Fields AllowedParams already declares. A declaration can outlive its map
    // entry — DocumentReference carried `issuerParty?: string` with nothing in
    // the map to serve it, so the field compiled and then threw "attribute
    // issuerParty is not allowed" from the constructor. Appending a second
    // `issuerParty?: IssuerParty` beside it is a duplicate identifier, so the
    // stale one is rewritten in place instead.
    const paramsBody = bodyBounds(scan, ALLOWED_PARAMS_OPEN)!;
    const declaredFields = new Set(
      [...scan.slice(paramsBody.start, paramsBody.end).matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]),
    );

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
        // One class is exported under several names, one per element it serves:
        // Party.ts exports Party, NotifyParty, CarrierParty and IssuerParty,
        // all the same class. Every existing map names the alias matching the
        // element — `cac:NotifyParty` is `() => NotifyParty` — which is the
        // only thing that makes a params map readable. A self-reference is
        // resolved in this module's own scope, where only the declared name
        // exists; using an export alias there is a ReferenceError at first use.
        classRef = isSelfReferential
          ? known.declared
          : (known.aliases.find((a) => a === local(child.name)) ?? known.classRef);
        tsType = classRef;
        if (!existingImports.has(classRef)) from = `./${basename(known.module, '.ts')}`;
        if (from === `./${basename(file, '.ts')}`) from = null; // defined in this file
      }

      let key = camel(local(child.name));
      if (repeats) key = pluralize(key);
      if (usedKeys.has(key)) return; // a differently-named entry already covers it
      usedKeys.add(key);

      // Lazy for component refs, eager for datatypes — which is exactly what
      // the 495 existing entries do: 153 cac-to-cac refs are all `() => X`,
      // and all 342 udt refs are bare. Components can form import cycles, and
      // resolveClassRef exists because six BillingReference entries once
      // captured undefined across one; datatypes are leaves and never can.
      additions.push({
        key,
        child,
        classRef,
        from,
        tsType: repeats ? `${tsType}[]` : tsType,
        lazy: !child.type.startsWith('udt:'),
      });
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

    const fieldFor = (a: Addition) => `  /** ${a.child.definition} */\n  ${a.key}?: ${a.tsType};`;
    const fresh = additions.filter((a) => !declaredFields.has(a.key));
    const restated = additions.filter((a) => declaredFields.has(a.key));
    const paramFields = fresh.map(fieldFor).join('\n');

    source = `${source.slice(0, mapOpen.index! + mapOpen[0].length)}\n${mapEntries}${source.slice(
      mapOpen.index! + mapOpen[0].length,
    )}`;

    if (fresh.length) {
      scan = blankComments(source);
      const reopened = ALLOWED_PARAMS_OPEN.exec(scan)!;
      source = `${source.slice(0, reopened.index! + reopened[0].length)}\n${paramFields}${source.slice(
        reopened.index! + reopened[0].length,
      )}`;
    }

    // Rewritten last so the offsets above stay valid, and matched on the
    // blanked copy so a commented-out declaration of the same name is left
    // alone. One at a time, because each rewrite moves everything after it.
    restated.forEach((a) => {
      scan = blankComments(source);
      // Bounded to the AllowedParams body, and matched a line at a time.
      // Searching the whole file found the params-map entry of the same name
      // first, where `[^;]*;` ran on to the map's own closing `};` — one
      // rewrite swallowed the entire map. A declaration is one line.
      const bounds = bodyBounds(scan, ALLOWED_PARAMS_OPEN)!;
      const at = new RegExp(`^  ${a.key}\\??:[^\\n]*;$`, 'm').exec(scan.slice(bounds.start, bounds.end));
      if (!at) return;
      const start = bounds.start + at.index;
      source = `${source.slice(0, start)}  ${a.key}?: ${a.tsType};${source.slice(start + at[0].length)}`;
    });

    // add any imports the new entries need
    const byModule = new Map<string, string[]>();
    additions
      .filter((a) => a.from)
      .forEach((a) => byModule.set(a.from!, [...(byModule.get(a.from!) ?? []), a.classRef]));
    byModule.forEach((symbols, module) => {
      const unique = [...new Set(symbols)].sort();
      scan = blankComments(source);
      const existing = new RegExp(`import \\{([^}]+)\\} from '${module.replace('.', '\\.')}';`).exec(scan);
      if (existing) {
        const merged = [...new Set([...existing[1].split(',').map((s) => s.trim()), ...unique])].filter(Boolean).sort();
        // Spliced by offset, not string-replaced: an identical import line
        // inside an earlier comment would otherwise be rewritten instead.
        const at = existing.index as number;
        source =
          source.slice(0, at) +
          `import { ${merged.join(', ')} } from '${module}';` +
          source.slice(at + existing[0].length);
      } else {
        // After the last existing import, not at offset 0: prepending put the
        // line above DocumentReference.ts's leading tslint pragma and above
        // every other file's core import, which reads like a mistake and is.
        const imports = [...blankComments(source).matchAll(/^import .*;$/gm)];
        const at = imports.length ? imports[imports.length - 1].index! + imports[imports.length - 1][0].length : 0;
        source = `${source.slice(0, at)}\nimport { ${unique.join(', ')} } from '${module}';${source.slice(at)}`;
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
