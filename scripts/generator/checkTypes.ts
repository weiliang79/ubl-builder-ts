import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Every params-map entry must have a matching field on AllowedParams.
 *
 * check:schema holds the map to the OASIS schemas, but nothing held the
 * TypeScript type beside it to the map — so a field could exist in the map and
 * be unusable, which is what happened to the six BillingReference entries
 * revived in step 6.
 */

import { ALLOWED_PARAMS_OPEN, blankComments, bodyBounds } from './source';

const CAC_DIR = join(__dirname, '..', '..', 'src', 'cac');

/** The body `open` introduces, as text. `source` is already comment-blanked. */
function slice(source: string, open: RegExp): string {
  const bounds = bodyBounds(source, open);
  return bounds ? source.slice(bounds.start, bounds.end) : '';
}

let checked = 0;
const problems: string[] = [];

readdirSync(CAC_DIR)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .forEach((file) => {
    // Blanked, so a commented-out entry is neither read as live nor able to
    // throw the brace counting off. This gate exists to catch declarations
    // that disagree with the map; it must not be fooled by the same trick.
    const source = blankComments(readFileSync(join(CAC_DIR, file), 'utf8'));
    const map = /const ParamsMap[^=]*=\s*\{/.exec(source);
    const params = ALLOWED_PARAMS_OPEN.exec(source);
    if (!map) return;
    // Loud, not silent. Three files wrote `interface AllowedParams {` where the
    // rest write `type AllowedParams = {`, and every scanner here quietly
    // stepped over them for as long as they have existed. A component with a
    // params map and no readable declaration beside it is a gap in the gate,
    // and the gate should say so rather than count itself lucky.
    if (!params) {
      problems.push(`${file}: has a ParamsMap but no AllowedParams this gate can read`);
      return;
    }

    checked += 1;
    const mapBody = slice(source, /const ParamsMap[^=]*=\s*\{/);
    const mapKeys = [...mapBody.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]);
    const typeKeys = new Set([...slice(source, ALLOWED_PARAMS_OPEN).matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]));

    mapKeys
      .filter((key) => !typeKeys.has(key))
      .forEach((key) => problems.push(`${file}: '${key}' is in the params map but not in AllowedParams`));

    // The other direction, which nothing checked. A declaration can outlive its
    // map entry: DocumentReference carried `issuerParty?: string` with nothing
    // in the map to serve it, so the field compiled and then threw "attribute
    // issuerParty is not allowed" from the constructor — a field offered by the
    // type and refused by the runtime. Both directions are the same defect,
    // and only one of them was being caught.
    const mapKeySet = new Set(mapKeys);
    [...typeKeys]
      .filter((key) => !mapKeySet.has(key))
      .forEach((key) => problems.push(`${file}: '${key}' is declared in AllowedParams but not in the params map`));

    // Arity, which nothing compared until a regression slipped through every
    // other gate. A field typed as an array against `max: 1` type-checks and
    // then throws "array given and max is defined" at serialization — reachable
    // from ordinary typed code, and invisible to tsc, check:schema and the
    // suite. The mirror case only forces a needless cast, but both mean the
    // declared type contradicts the map beside it.
    // Bounded to one entry. The obvious lazy `[\s\S]*?max:` is unbounded, so an
    // entry that omits `max` — legal, since ParamsMapValues.max is optional —
    // swallows the next entry's value and reports a false arity failure against
    // the wrong field while skipping the right one.
    const maxOf = new Map<string, string>();
    for (const m of mapBody.matchAll(/^\s{2}(\w+):\s*\{((?:[^{}]|\{[^{}]*\})*)\}/gm)) {
      maxOf.set(m[1], /max:\s*(\d+|undefined)/.exec(m[2])?.[1] ?? 'undefined');
    }
    for (const m of slice(source, ALLOWED_PARAMS_OPEN).matchAll(/^\s{2}(\w+)\??:\s*([^;]+);/gm)) {
      const [, key, declared] = m;
      const max = maxOf.get(key);
      if (max === undefined) continue;
      // Any arm being an array is enough to pass one, so `string[] | UdtText`
      // can throw against max: 1 even though the string ends in `UdtText`.
      const isArray = declared.split('|').some((arm) => /\[\]$/.test(arm.trim()));
      const repeats = max === 'undefined';
      if (isArray === repeats) continue;
      problems.push(
        `${file}: '${key}' is declared ${isArray ? 'an array' : 'a single value'} but the map says max: ${max}` +
          (isArray ? ' — passing an array throws at serialization' : ''),
      );
    }
  });

console.log(`checked ${checked} components`);
if (problems.length) {
  problems.forEach((p) => console.log(`  ${p}`));
  console.log(`\n${problems.length} field(s) disagree with the params map`);
  process.exitCode = 1;
} else {
  console.log('params map and AllowedParams agree on every key, and arity agrees with max');
}
