import { readFileSync } from 'fs';
import { basename, join } from 'path';
import { Schema, SchemaType } from './schema';
import { blankComments } from './source';

/**
 * What class implements which schema type, read out of src/cac itself.
 *
 * Shared because two tools need the same answer and must not answer it
 * differently: generate:complete picks the classRef to emit, and check:classref
 * decides whether the classRef already there is the right one. A gate built on
 * its own copy of this would agree with the generator by luck.
 */

export const CAC_DIR = join(__dirname, '..', '..', 'src', 'cac');

export const local = (name: string) => name.trim().split(':').pop() as string;
/**
 * `ChildConsignment` -> `childConsignment`, and `ID` -> `id`.
 *
 * A leading run of capitals is an acronym and lowercases whole — every
 * hand-written component keys cbc:ID as `id`, and naive camelCasing produced
 * `iD` across 58 generated files. The last capital of the run stays when a
 * lowercase letter follows it, so `UNDGCode` becomes `undgCode` rather than
 * `undgcode`.
 */
export const camel = (name: string): string => {
  const acronym = /^([A-Z]+)(?=[A-Z][a-z]|$)/.exec(name);
  if (acronym) return acronym[1].toLowerCase() + name.slice(acronym[1].length);
  return name.charAt(0).toLowerCase() + name.slice(1);
};

/** Match the dominant convention: repeating elements get a plural key. */
export function pluralize(word: string): string {
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  return `${word}s`;
}

/** `udt:IdentifierType` -> `UdtIdentifier`. */
export function udtClass(type: string): string {
  return `Udt${local(type).replace(/Type$/, '')}`;
}

export interface Learned {
  /** The name to import by default: the export alias matching the file name. */
  classRef: string;
  /** Every name the module exports the class under, so a child element can pick
   *  the one named after it — cac:IssuerParty imports IssuerParty, not Party. */
  aliases: string[];
  /** The name the class statement binds, which a same-file reference must use. */
  declared: string;
  module: string;
}

/**
 * Map each schema type to the class that implements it.
 *
 * Keyed by type rather than by element name: a type is often reachable through
 * an element no existing map happens to use — cac:CountryType via
 * cac:OriginCountry, say — and keying by element would miss those.
 */
export function learnByType(files: string[], schema: Schema): Map<string, Learned> {
  const learned = new Map<string, Learned>();

  files.forEach((file) => {
    const stem = basename(file, '.ts');
    const type = schemaTypeFor(stem, schema);
    if (!type) return;
    const key = schema.elements.get(`cac:${stem}`) ?? `cac:${type.name}`;
    // Blanked: the `export { … }` scan below is not line-anchored, so a
    // commented-out export block would otherwise be learned as real.
    const source = blankComments(readFileSync(join(CAC_DIR, file), 'utf8'));

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
    learned.set(key, { classRef, aliases: names, declared: primary, module: file });
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
    const source = blankComments(readFileSync(join(CAC_DIR, file), 'utf8'));
    for (const m of source.matchAll(/attributeName:\s*'(cac:[^']+)',[^}]*?classRef:\s*(?:\(\) =>\s*)?(\w+)/g)) {
      const type = schema.elements.get(m[1]);
      const ref = m[2];
      if (!type || learned.has(type)) continue;
      // `classRef: null` is a deliberate placeholder in a few maps for types
      // with no component class yet; it is not a name to learn.
      if (!/^[A-Z]\w*$/.test(ref)) continue;
      // The module recorded here becomes an import path later, so it must be
      // where the symbol actually lives. Declared in this file is fine; merely
      // imported into it is not — a file that imports X does not necessarily
      // re-export it, and pointing an import at it emits code that will not
      // compile. When it is imported, follow the import to its real home.
      const from = importsOf(source).get(ref);
      if (declaredIn(source).has(ref)) {
        learned.set(type, { classRef: ref, aliases: [ref], declared: ref, module: file });
      } else if (from?.startsWith('./')) {
        learned.set(type, { classRef: ref, aliases: [ref], declared: ref, module: `${from.slice(2)}.ts` });
      }
    }
  });

  return learned;
}

/** Class names this file declares itself. */
export function declaredIn(source: string): Set<string> {
  return new Set([...source.matchAll(/^(?:export )?(?:default )?(?:abstract )?class (\w+)/gm)].map((m) => m[1]));
}

/** Where a symbol is imported from, if the file already imports it. */
export function importsOf(source: string): Map<string, string> {
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

export function schemaTypeFor(stem: string, schema: Schema): SchemaType | undefined {
  const viaElement = schema.elements.get(`cac:${stem}`);
  return (
    (viaElement ? schema.types.get(viaElement) : undefined) ??
    schema.types.get(`cac:${stem}Type`) ??
    schema.types.get(`doc:${stem}Type`)
  );
}

/**
 * Names that refer to the same class, keyed by every one of them.
 *
 * `export { DeliveryUnitType as MaximumDeliveryUnit, DeliveryUnitType as
 * MinimumDeliveryUnit }` makes three names for one class, and a params map
 * entry may reasonably use any of them — Delivery declares
 * `maximumDeliveryUnit: MaximumDeliveryUnit` against `classRef:
 * MinimumDeliveryUnit`, which reads like a copy-paste slip and is in fact the
 * same class twice. Anything comparing a declared type to a classRef has to
 * know that before it starts reporting.
 *
 * Only classes. Every file also writes `AllowedParams as SomethingParams`, and
 * grouping by name alone made `AllowedParams` a hub joining all 61 of those
 * into one group — a set that would have let the declaration check accept any
 * of 61 unrelated names had a classRef ever landed in it.
 */
export function aliasGroups(files: string[]): Map<string, Set<string>> {
  const groups = new Map<string, Set<string>>();

  files.forEach((file) => {
    const source = blankComments(readFileSync(join(CAC_DIR, file), 'utf8'));
    const classes = declaredIn(source);
    for (const block of source.matchAll(/export \{([^}]+)\}/g)) {
      for (const part of block[1].split(',')) {
        const [from, to] = part.split(/\s+as\s+/).map((x) => x.trim());
        if (!from || !classes.has(from)) continue;
        const names = [from, to ?? from];
        const merged = new Set<string>(names);
        names.forEach((n) => groups.get(n)?.forEach((x) => merged.add(x)));
        merged.forEach((n) => groups.set(n, merged));
      }
    }
  });

  return groups;
}
