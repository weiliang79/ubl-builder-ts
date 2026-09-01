/**
 * Source-text helpers shared by the generator scripts.
 *
 * Every one of these tools reads TypeScript with regexes, and every one of them
 * has at some point mistaken a commented-out params-map entry for a live one.
 * It happened three times in three different scanners before anyone asked where
 * else it could happen. This module exists so the answer is "nowhere".
 */

/**
 * Replace every comment with the same number of spaces.
 *
 * Blanking rather than stripping, because callers index into the
 * original source for surgical splicing — removing characters would
 * shift them all. Newlines are kept so line-anchored patterns still work.
 *
 * This exists because commented-out entries were being read as live ones.
 * ProjectReference.ts carries a commented `issueDate` naming
 * cac:WorkPhaseReference (0..*), which overwrote the real `issueDate`
 * (cbc:IssueDate, max 1) and pluralised a scalar field into one that throws.
 * The same bug has now been found in three separate scans; this is the
 * shared fix.
 */
export function blankComments(source: string): string {
  const out = source.split('');
  let i = 0;
  let quote: string | null = null;
  while (i < source.length) {
    const c = source[i];
    if (quote) {
      if (c === '\\') i += 1;
      else if (c === quote) quote = null;
      i += 1;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      quote = c;
      i += 1;
      continue;
    }
    if (c === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') out[i++] = ' ';
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? source.length : end + 2;
      for (; i < stop; i += 1) if (source[i] !== '\n') out[i] = ' ';
      continue;
    }
    i += 1;
  }
  return out.join('');
}
