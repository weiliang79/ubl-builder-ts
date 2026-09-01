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

import { blankComments } from './source';

const CAC_DIR = join(__dirname, '..', '..', 'src', 'cac');

function body(source: string, start: number): string {
  let depth = 1;
  let i = start;
  for (; i < source.length && depth > 0; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') depth -= 1;
  }
  return source.slice(start, i - 1);
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
    const params = /type AllowedParams\s*=\s*\{/.exec(source);
    if (!map || !params) return;

    checked += 1;
    const mapBody = body(source, map.index + map[0].length);
    const mapKeys = [...mapBody.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]);
    const typeKeys = new Set(
      [...body(source, params.index + params[0].length).matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]),
    );

    mapKeys
      .filter((key) => !typeKeys.has(key))
      .forEach((key) => problems.push(`${file}: '${key}' is in the params map but not in AllowedParams`));

    // Arity, which nothing compared until a regression slipped through every
    // other gate. A field typed as an array against `max: 1` type-checks and
    // then throws "array given and max is defined" at serialization — reachable
    // from ordinary typed code, and invisible to tsc, check:schema and the
    // suite. The mirror case only forces a needless cast, but both mean the
    // declared type contradicts the map beside it.
    const maxOf = new Map(
      [...mapBody.matchAll(/^\s{2}(\w+):\s*\{[\s\S]*?max:\s*(\d+|undefined)/gm)].map((m) => [m[1], m[2]]),
    );
    for (const m of body(source, params.index + params[0].length).matchAll(/^\s{2}(\w+)\??:\s*([^;]+);/gm)) {
      const [, key, declared] = m;
      const max = maxOf.get(key);
      if (max === undefined) continue;
      const isArray = /\[\]$/.test(declared.trim());
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
  console.log('every params-map entry is reachable, and arity agrees with max');
}
