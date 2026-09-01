import * as ts from 'typescript';

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
 *
 * The comment ranges come from the TypeScript parser rather than a hand-rolled
 * scan. The hand-rolled one tracked quotes but had no concept of a regex
 * literal, so a regex holding an odd number of quote characters — say
 * `/attributeName:\s*'([^']*)'/` — opened a string that never closed, and every
 * comment after it in the file stayed visible. That failure is silent and
 * points the wrong way: it hands a caller commented-out entries as live ones,
 * which is the exact bug this module exists to prevent. No file under src/cac
 * contains a regex today, so nothing had broken yet; borrowing the real parser
 * means nothing can.
 */
export function blankComments(source: string): string {
  const out = source.split('');
  const sourceFile = ts.createSourceFile('source.ts', source, ts.ScriptTarget.Latest, true);

  const blank = (range: ts.CommentRange): void => {
    for (let i = range.pos; i < range.end; i += 1) {
      if (source[i] !== '\n') out[i] = ' ';
    }
  };

  // Every comment in a file is trivia attached to exactly one token, and the
  // end-of-file token carries whatever trails the last statement.
  const visit = (node: ts.Node): void => {
    ts.getLeadingCommentRanges(source, node.getFullStart())?.forEach(blank);
    ts.getTrailingCommentRanges(source, node.getEnd())?.forEach(blank);
    node.getChildren(sourceFile).forEach(visit);
  };
  visit(sourceFile);

  return out.join('');
}

/**
 * Matches the opening brace of an `AllowedParams` declaration, in either form.
 *
 * Three of the 52 components under src/cac — DocumentReference, PostalAddress
 * and ItemPriceExtension — write `interface AllowedParams {` where the other 49
 * write `type AllowedParams = {`. Every scanner here looked only for the type
 * alias and returned early on the rest, so those three were silently exempt
 * from all of it: check:schema never compared their optionality or arity,
 * check:types never checked their keys were reachable, and generate:complete
 * never noticed that PostalAddress declares 9 of the 27 children AddressType
 * has. `report:schema` uses a different scan and had been reporting those 18
 * missing elements the whole time; nobody reconciled the two numbers.
 *
 * A skip that reports nothing is the worst thing a gate can do, so this lives
 * next to blankComments: one definition, and checkTypes now fails on a file it
 * cannot read rather than passing over it.
 */
export const ALLOWED_PARAMS_OPEN = /(?:type AllowedParams\s*=\s*|interface AllowedParams\s*)\{/;
