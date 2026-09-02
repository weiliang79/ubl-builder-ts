import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CAC_DIR, camel, learnByType, local, pluralize, schemaTypeFor, udtClass } from './components';
import { loadSchema, Schema, SchemaChild } from './schema';
import { blankComments, bodyBounds } from './source';

/**
 * Write the component files UBL defines and this package does not have.
 *
 * generate:complete adds children to components that exist; it cannot create
 * one. Thirty-one children were unreachable for want of 26 classes, and those
 * 26 need 31 more to describe their own children — 57 files in all. Stopping
 * part-way is worse than not starting: building only the 26 leaves 67 children
 * blocked instead of 31, because each new type's own aggregate children become
 * the new frontier.
 *
 * Everything here is derived from the schema, so the three gates check it the
 * same way they check the files that were written by hand.
 *
 * Re-running is a no-op: a type that has a class is not missing. Pass --force
 * to rewrite the files this script wrote, which is how a change here reaches
 * them; files written by hand are never touched either way.
 */

/** The marker that says a file came from here, and may be rewritten. */
const GENERATED_BY = 'npm run scaffold';

interface Emitted {
  type: string;
  className: string;
  file: string;
  /** One alias per element this type serves, so a params map can name the one it means. */
  aliases: string[];
  serves: string;
}

/** `cac:PersonType` -> `Person`. */
const classNameFor = (type: string): string => local(type).replace(/Type$/, '');

function closureOf(schema: Schema, present: Set<string>): string[] {
  const missing = new Set<string>();
  const queue: string[] = [];

  present.forEach((type) => {
    schema.types.get(type)?.children.forEach((child) => {
      if (child.type.startsWith('cac:') && !present.has(child.type)) queue.push(child.type);
    });
  });

  while (queue.length) {
    const type = queue.shift() as string;
    if (missing.has(type) || present.has(type)) continue;
    missing.add(type);
    schema.types.get(type)?.children.forEach((child) => {
      if (child.type.startsWith('cac:') && !present.has(child.type) && !missing.has(child.type)) {
        queue.push(child.type);
      }
    });
  }

  return [...missing].sort();
}

/** The params key for a child: camelCase, pluralised when UBL says unbounded. */
function keyFor(child: SchemaChild, used: Set<string>): string {
  const base = camel(local(child.name));
  const wanted = child.maxOccurs === null ? pluralize(base) : base;
  // Two children can pluralise onto one key; the singular is the fallback and
  // check:types would fail on a collision either way.
  const key = used.has(wanted) ? base : wanted;
  used.add(key);
  return key;
}

function render(
  type: string,
  schema: Schema,
  emitted: Map<string, Emitted>,
  known: ReturnType<typeof learnByType>,
): string {
  const self = emitted.get(type) as Emitted;
  const definition = schema.types.get(type) as { name: string; children: SchemaChild[] };

  const udtImports = new Set<string>();
  const cacImports = new Map<string, Set<string>>();
  const entries: string[] = [];
  const fields: string[] = [];
  const used = new Set<string>();

  definition.children.forEach((child, index) => {
    const key = keyFor(child, used);
    const repeats = child.maxOccurs === null;
    let classRef: string;
    let tsType: string;

    if (child.type.startsWith('udt:')) {
      classRef = udtClass(child.type);
      tsType = `string | ${classRef}`;
      udtImports.add(classRef);
    } else {
      const target = emitted.get(child.type);
      const existing = known.get(child.type);
      // Prefer the alias named after the element, which is what every
      // hand-written map does — cac:IssuerParty names IssuerParty, not Party.
      const names = target
        ? [target.className, ...target.aliases]
        : existing
          ? [existing.classRef, ...existing.aliases]
          : [];
      const wanted = local(child.name);
      // A self-reference is resolved in this module's own scope, where only the
      // class statement's name is bound — cac:ChildConsignment is a
      // ConsignmentType, and naming the alias there is a ReferenceError at
      // first use rather than a compile error anywhere.
      classRef = child.type === type ? self.className : names.includes(wanted) ? wanted : (names[0] ?? '');
      if (!classRef) return; // no class for this type anywhere; generate:complete reports it
      tsType = classRef;
      if (child.type !== type) {
        const module = target
          ? `./${target.file}`
          : `./${(existing as { module: string }).module.replace(/\.ts$/, '')}`;
        cacImports.set(module, (cacImports.get(module) ?? new Set()).add(classRef));
      }
    }

    const lazy = !child.type.startsWith('udt:');
    entries.push(
      `  ${key}: { order: ${index + 1}, attributeName: '${child.name}', ` +
        `max: ${repeats ? 'undefined' : child.maxOccurs}, classRef: ${lazy ? `() => ${classRef}` : classRef} },`,
    );
    fields.push(
      `  /** ${child.definition} */\n  ${key}${child.minOccurs > 0 ? '' : '?'}: ${repeats ? `(${tsType})[]` : tsType};`,
    );
  });

  const imports = [
    `import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';`,
    udtImports.size ? `import { ${[...udtImports].sort().join(', ')} } from '../datatypes/udt';` : '',
    ...[...cacImports.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, names]) => `import { ${[...names].sort().join(', ')} } from '${module}';`),
  ].filter(Boolean);

  const exports = [
    self.className,
    `AllowedParams as ${self.className}Params`,
    ...self.aliases.map((alias) => `${self.className} as ${alias}`),
  ].sort((a, b) => {
    const nameOf = (x: string) => x.split(' as ').pop() as string;
    return nameOf(a).toLowerCase().localeCompare(nameOf(b).toLowerCase());
  });

  return `${imports.join('\n')}

/**
 * ${type}
 *
 * Generated from the OASIS UBL 2.1 schemas by \`npm run scaffold\`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from ${type}; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
${entries.join('\n')}
};

type AllowedParams = {
${fields.join('\n')}
};

class ${self.className} extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, '${self.serves}');
  }
}

export {
${exports.map((e) => `  ${e},`).join('\n')}
};
`;
}

function main(): void {
  const schema = loadSchema();
  const files = readdirSync(CAC_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
  const known = learnByType(files, schema);

  const present = new Set<string>();
  files.forEach((file) => {
    const type = schemaTypeFor(file.replace(/\.ts$/, ''), schema);
    if (type) present.add(`cac:${type.name}`);
  });

  // --force rewrites the files this script wrote before, which is how a fix to
  // the generator reaches them: a type that already has a class is not missing,
  // so without it the only way to pick up a change was to delete 58 files by
  // hand. It rewrites nothing that was written by hand.
  const force = process.argv.includes('--force');
  const rewritable = force
    ? [...present].filter((type) => {
        const file = join(CAC_DIR, `${classNameFor(type)}.ts`);
        return existsSync(file) && readFileSync(file, 'utf8').includes(GENERATED_BY);
      })
    : [];

  const missing = [...closureOf(schema, present), ...rewritable].sort();
  if (!missing.length) {
    console.log(
      force
        ? 'no generated files to rewrite, and no schema type is missing a class'
        : 'every schema type reachable from a component has a class',
    );
    return;
  }

  // Every element each new type serves, so its params maps can name the alias
  // matching the element rather than the class.
  const elementsOf = new Map<string, string[]>();
  for (const [element, type] of schema.elements) {
    if (missing.includes(type)) elementsOf.set(type, [...(elementsOf.get(type) ?? []), local(element)]);
  }

  const emitted = new Map<string, Emitted>();
  missing.forEach((type) => {
    const className = classNameFor(type);
    const names = elementsOf.get(type) ?? [];
    emitted.set(type, {
      type,
      className,
      file: className,
      aliases: [...new Set(names)].filter((n) => n !== className).sort(),
      serves: names.includes(className) ? `cac:${className}` : type,
    });
  });

  const write = !process.argv.includes('--check');
  emitted.forEach((info, type) => {
    const path = join(CAC_DIR, `${info.file}.ts`);
    if (write) writeFileSync(path, render(type, schema, emitted, known));
  });

  console.log(`${write ? 'wrote' : 'would write'} ${emitted.size} component files:`);
  [...emitted.values()]
    .sort((a, b) => a.className.localeCompare(b.className))
    .forEach((info) => {
      const count = schema.types.get(info.type)?.children.length ?? 0;
      console.log(
        `  ${`${info.file}.ts`.padEnd(34)} ${String(count).padStart(3)} children` +
          (info.aliases.length ? `  +${info.aliases.length} aliases` : ''),
      );
    });

  if (write) {
    const barrel = join(CAC_DIR, 'index.ts');
    const source = readFileSync(barrel, 'utf8');
    const names: string[] = [];
    const importLines: string[] = [];
    [...emitted.values()]
      .sort((a, b) => a.className.localeCompare(b.className))
      .forEach((info) => {
        const all = [info.className, `${info.className}Params`, ...info.aliases].sort();
        names.push(...all);
        importLines.push(`import { ${all.join(', ')} } from './${info.file}';`);
      });

    const blanked = blankComments(source);
    const lastImport = [...blanked.matchAll(/^import .*;$/gm)].pop();
    const at = lastImport ? (lastImport.index as number) + lastImport[0].length : 0;
    let next = `${source.slice(0, at)}\n${importLines.join('\n')}${source.slice(at)}`;

    const block = bodyBounds(blankComments(next), /^export \{/m) as { start: number; end: number };
    const existing = next
      .slice(block.start, block.end)
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);
    const merged = [...new Set([...existing, ...names])].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    next = `${next.slice(0, block.start)}\n${merged.map((n) => `  ${n},`).join('\n')}\n${next.slice(block.end)}`;
    writeFileSync(barrel, next);
    console.log(`\nbarrel: ${merged.length} names`);
  }
}

main();
