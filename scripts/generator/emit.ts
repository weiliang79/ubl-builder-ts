import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { loadSchema, Schema, SchemaChild } from './schema';

/**
 * Corrects the params maps in place from the OASIS schemas.
 *
 * This is deliberately a *correcting* pass rather than a wholesale emitter.
 * It rewrites the element name, minOccurs and maxOccurs of entries that
 * already exist, and leaves everything else — the classRef, the class body,
 * the exports — untouched. Adding the elements the fork never transcribed
 * needs import management and 18 component types that do not exist yet; that
 * is a separate job.
 */

const SRC = join(__dirname, '..', '..', 'src');
const CAC_DIR = join(SRC, 'cac');
const DOCUMENTS_DIR = join(SRC, 'documents');

interface Entry {
  raw: string;
  /** Offsets of this entry within the params-map body, for in-place splicing. */
  start: number;
  end: number;
  key: string;
  name: string;
  order: string;
  max: string;
  classRef: string;
}

/**
 * Read the params map by tracking brace depth.
 *
 * Prettier wraps longer entries across several lines, so a line-oriented
 * parser sees only a third of the files.
 */
function readEntries(source: string): { entries: Entry[]; bodyStart: number; bodyEnd: number } | null {
  const open = /const (?:ParamsMap|\w*CHILDREN_MAP)[^=]*=\s*\{/.exec(source);
  if (!open) return null;

  const bodyStart = (open.index as number) + open[0].length;
  let depth = 1;
  let i = bodyStart;
  for (; i < source.length && depth > 0; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') depth -= 1;
  }
  const bodyEnd = i - 1;
  const body = source.slice(bodyStart, bodyEnd);

  const entries: Entry[] = [];
  let cursor = 0;
  while (cursor < body.length) {
    const keyMatch = /(\w+):\s*\{/.exec(body.slice(cursor));
    if (!keyMatch) break;
    const entryStart = cursor + (keyMatch.index as number);
    let d = 0;
    let j = entryStart + keyMatch[0].length - 1;
    for (; j < body.length; j += 1) {
      if (body[j] === '{') d += 1;
      else if (body[j] === '}') {
        d -= 1;
        if (d === 0) break;
      }
    }
    const raw = body.slice(entryStart, j + 1);
    const field = (name: string) => new RegExp(`${name}:\\s*([^,}]+)`).exec(raw)?.[1].trim() ?? '';
    entries.push({
      raw,
      start: entryStart,
      end: j + 1,
      key: keyMatch[1],
      name: /(?:attributeName|childName):\s*'([^']*)'/.exec(raw)?.[1] ?? '',
      order: field('order'),
      max: field('max') || 'undefined',
      classRef: field('classRef'),
    });
    cursor = j + 1;
  }
  return entries.length ? { entries, bodyStart, bodyEnd } : null;
}

/** Offsets of the `{ … }` body opened by `open`, by brace depth. */
function bodyBounds(source: string, open: RegExp): { start: number; end: number } | null {
  const m = open.exec(source);
  if (!m) return null;
  const start = (m.index as number) + m[0].length;
  let depth = 1;
  let i = start;
  for (; i < source.length && depth > 0; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') depth -= 1;
  }
  return { start, end: i - 1 };
}

/**
 * Align AllowedParams optionality with the schema.
 *
 * These were transcribed by hand and drifted badly: 193 fields were declared
 * required where UBL says minOccurs="0". That is type-level only — assignContent
 * skips undefined — but it forces callers to pass elements they do not want,
 * and it made three of the four self-referential children unusable without a
 * cast. Four fields drift the other way and are genuinely mandatory, so they
 * tighten: an AddressLine with no cbc:Line, or a TaxCategory with no
 * cac:TaxScheme, serialises to schema-invalid XML.
 *
 * D8 says cac/ stays exactly as permissive as UBL. That cuts both ways.
 */
function alignOptionality(source: string, want: Map<string, boolean>): { source: string; changes: string[] } {
  const bounds = bodyBounds(source, /type AllowedParams\s*=\s*\{/);
  if (!bounds) return { source, changes: [] };

  const changes: string[] = [];
  const body = source.slice(bounds.start, bounds.end);
  const rebuilt = body.replace(/^(\s{2})(\w+)(\??):/gm, (whole, indent: string, key: string, q: string) => {
    const optional = want.get(key);
    if (optional === undefined) return whole; // not in the params map; leave alone
    const isOptional = q === '?';
    if (isOptional === optional) return whole;
    changes.push(`${key}: ${isOptional ? 'optional -> required' : 'required -> optional'}`);
    return `${indent}${key}${optional ? '?' : ''}:`;
  });

  return { source: source.slice(0, bounds.start) + rebuilt + source.slice(bounds.end), changes };
}

const local = (name: string) => name.trim().split(':').pop() as string;
const capitalize = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

/**
 * Pair a hand-written entry with its schema child.
 *
 * Exact name first, then the local name case-insensitively — which recovers
 * the wrong-prefix, wrong-case and trailing-space defects — then the TS key,
 * which recovers entries whose element name was written as a type name.
 */
function matchChild(entry: Entry, children: SchemaChild[], taken: Set<string>): SchemaChild | undefined {
  const free = children.filter((c) => !taken.has(c.name));
  const byExact = free.find((c) => c.name === entry.name);
  if (byExact) return byExact;

  const wanted = local(entry.name).toLowerCase();
  const byLocal = free.find((c) => local(c.name).toLowerCase() === wanted);
  if (byLocal) return byLocal;

  const byKey = free.find((c) => local(c.name) === capitalize(entry.key));
  return byKey;
}

function schemaTypeFor(stem: string, schema: Schema) {
  const viaElement = schema.elements.get(`cac:${stem}`);
  return (
    (viaElement ? schema.types.get(viaElement) : undefined) ??
    schema.types.get(`cac:${stem}Type`) ??
    schema.types.get(`doc:${stem}Type`)
  );
}

function main(): void {
  const schema = loadSchema();
  const write = !process.argv.includes('--check');
  let corrected = 0;
  let filesChanged = 0;
  const skipped: string[] = [];

  const targets: [string, string][] = [
    ...readdirSync(CAC_DIR)
      .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
      .map((f): [string, string] => [CAC_DIR, f]),
    // The document's children map was reported but never corrected, because
    // this only ever globbed src/cac. It is the least-covered file and the
    // most-used one.
    [DOCUMENTS_DIR, 'ChildrenMap.ts'],
  ];

  targets.forEach(([dir, file]) => {
    const path = join(dir, file);
    const source = readFileSync(path, 'utf8');
    const parsed = readEntries(source);
    const stem = file === 'ChildrenMap.ts' ? 'Invoice' : basename(file, '.ts');
    const type = schemaTypeFor(stem, schema);

    if (!parsed || !type) {
      if (type) skipped.push(file);
      return;
    }

    const taken = new Set<string>();
    const changes: string[] = [];
    const edits: { start: number; end: number; text: string }[] = [];
    const wantOptional = new Map<string, boolean>();

    parsed.entries.forEach((entry) => {
      const child = matchChild(entry, type.children, taken);
      if (!child) return;
      taken.add(child.name);

      const max = child.maxOccurs === null ? 'undefined' : String(child.maxOccurs);
      const order = String(type.children.indexOf(child) + 1);
      wantOptional.set(entry.key, child.minOccurs === 0);

      if (entry.name !== child.name) changes.push(`${entry.key}: name '${entry.name}' -> '${child.name}'`);
      if (entry.max !== max) changes.push(`${entry.key}: max ${entry.max} -> ${max}`);
      // `order` decides the emitted sequence, so a wrong value is a real
      // defect rather than untidiness. It went uncompared until a duplicate
      // order in PayeeFinancialAccount surfaced it.
      if (entry.order !== order) changes.push(`${entry.key}: order ${entry.order} -> ${order}`);

      // Surgical field replacement: everything else in the entry, and every
      // comment between entries, is left exactly as written.
      const text = entry.raw
        .replace(/order:\s*\d+/, `order: ${order}`)
        .replace(/(attributeName|childName):\s*'[^']*'/, `$1: '${child.name}'`)
        .replace(/max:\s*(?:\d+|undefined)/, `max: ${max}`);
      edits.push({ start: entry.start, end: entry.end, text });
    });

    const body = source.slice(parsed.bodyStart, parsed.bodyEnd);
    let rebuiltBody = '';
    let cursor = 0;
    edits.forEach((edit) => {
      rebuiltBody += body.slice(cursor, edit.start) + edit.text;
      cursor = edit.end;
    });
    rebuiltBody += body.slice(cursor);
    let next = source.slice(0, parsed.bodyStart) + rebuiltBody + source.slice(parsed.bodyEnd);

    const optionality = alignOptionality(next, wantOptional);
    next = optionality.source;
    changes.push(...optionality.changes);

    if (changes.length === 0) return;
    corrected += changes.length;
    filesChanged += 1;
    console.log(`\n${file}`);
    changes.forEach((c) => console.log(`    ${c}`));

    if (write) writeFileSync(path, next);
  });

  console.log(`\n${'='.repeat(64)}`);
  console.log(`${write ? 'corrected' : 'would correct'} ${corrected} entries across ${filesChanged} files`);
  if (skipped.length) {
    console.log(`\nnot machine-editable (multi-line entries), left alone:\n  ${skipped.join(', ')}`);
  }
  if (!write && corrected > 0) process.exitCode = 1;
}

main();
