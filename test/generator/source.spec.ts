import { blankComments } from '../../scripts/generator/source';

/**
 * Four scanners under scripts/generator now read src/cac through this one
 * helper, and every one of them had previously mistaken a commented-out
 * params-map entry for a live one. If blanking is wrong, all four are wrong
 * together, and wrong in the direction that emits code — a `classRef` for a
 * type nobody imports, or an arity taken from an element that was commented
 * out years ago.
 */
describe('blankComments', () => {
  const commented = "// agentParty: { order: 16, attributeName: 'cac:AgentParty', max: 1 },";
  const seesEntry = (text: string): boolean => /attributeName:\s*'cac:AgentParty'/.test(text);

  it('hides a commented-out entry from a scanner', () => {
    expect(seesEntry(blankComments(commented))).toBe(false);
  });

  it('leaves a live entry alone', () => {
    const live = "  agentParty: { order: 16, attributeName: 'cac:AgentParty', max: 1 },";
    expect(blankComments(live)).toBe(live);
  });

  it('preserves offsets and line numbers, because callers splice by index', () => {
    const source = ['const a = 1; // trailing', '/* block', '   spanning */', 'const b = 2;'].join('\n');
    const blanked = blankComments(source);

    expect(blanked).toHaveLength(source.length);
    expect(blanked.split('\n')).toHaveLength(source.split('\n').length);
    expect(blanked.split('\n')[0]).toBe('const a = 1;            ');
    expect(blanked.split('\n')[3]).toBe('const b = 2;');
  });

  it('does not mistake a URL inside a string for a comment', () => {
    const source = "const ns = 'urn://example.com/a';";
    expect(blankComments(source)).toBe(source);
  });

  it('does not mistake comment markers inside a string for comments', () => {
    const source = "const s = '/* not a comment */';";
    expect(blankComments(source)).toBe(source);
  });

  it('sees through a regex literal holding an odd number of quotes', () => {
    // The hand-rolled scanner this replaced had no concept of a regex literal.
    // The third quote here opened a string it never closed, so every comment
    // after this line in the file stayed visible — the precise failure the
    // helper exists to rule out, pointing the wrong way.
    const source = ["const re = /attributeName:\\s*'(cac:[^']+)'/;", commented].join('\n');

    expect(seesEntry(blankComments(source))).toBe(false);
  });

  it('keeps a comment inside a template literal placeholder blanked', () => {
    const source = ['const t = `${', '  1 // inner', '}`;'].join('\n');
    const blanked = blankComments(source);

    expect(blanked).toHaveLength(source.length);
    expect(blanked).not.toContain('inner');
  });
});
