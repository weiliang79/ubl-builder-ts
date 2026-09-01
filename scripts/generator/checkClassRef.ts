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
let compared = 0;

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
      if (expected.includes(declared)) continue;

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
