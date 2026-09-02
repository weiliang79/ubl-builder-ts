/**
 * Emit a fixture both ways, so `check:c14n` can compare them.
 *
 * Writes the document as this library would submit it, and as this library
 * would digest it. `scripts/check-canonical.sh` then canonicalizes the first
 * with xmllint and diffs it against the second — which is exactly the check
 * LHDN performs when it verifies a signature: canonicalize the bytes that
 * arrived, and compare the digest against the one in the signature.
 *
 * Usage: canonicalize.ts <input.xml> <out-submitted.xml> <out-canonical.xml>
 */

import { readFileSync, writeFileSync } from 'fs';
import { ParsedElement, parseXml } from '../src/core/parse';
import { toXmlString } from '../src/core/serialize';
import { XmlNode } from '../src/core/xmlNode';

/** A parsed element is a node tree already; only the optional value differs. */
function toNode(element: ParsedElement): XmlNode {
  return {
    name: element.name,
    ...(element.value !== undefined ? { value: element.value } : {}),
    attributes: element.attributes,
    children: element.children.map(toNode),
  };
}

function main(): void {
  const [input, submitted, canonical] = process.argv.slice(2);
  if (!input || !submitted || !canonical) {
    console.error('usage: canonicalize.ts <input.xml> <out-submitted.xml> <out-canonical.xml>');
    process.exit(2);
  }

  const node = toNode(parseXml(readFileSync(input, 'utf8')));

  writeFileSync(submitted, toXmlString(node, { headless: true }));
  writeFileSync(canonical, toXmlString(node, { canonical: true }));
}

main();
