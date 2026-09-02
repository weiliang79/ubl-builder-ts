import { keepAttribute, XmlAttributes, XmlNode } from './xmlNode';

/**
 * Canonical XML 1.1 — https://www.w3.org/TR/xml-c14n11/
 *
 * A signature is a claim about *bytes*, but XML lets the same document be
 * written many ways: attributes in any order, `<a/>` or `<a></a>`, `&gt;` or
 * `>`. Canonicalization picks one spelling so that signer and verifier hash
 * the same thing. MyInvois names this exact algorithm — `xml-c14n11`,
 * `http://www.w3.org/2006/12/xml-c14n11` — in the `ds:Transform` of the first
 * `ds:Reference`.
 *
 * ## Why this is written here rather than taken from a library
 *
 * Node has no canonicalizer, and the ones on npm are Node-only. `signing/digest.ts`
 * deliberately reaches for Web Crypto so this package still runs in a browser;
 * pulling in a DOM-based C14N implementation would undo that for the sake of
 * one traversal. We already own the node tree, so we can write the canonical
 * form directly.
 *
 * ## Non-exclusive, and that matters
 *
 * c14n11 is *not* exclusive c14n. It keeps every namespace declaration that is
 * in scope, including ones no element in the fragment actually uses. That is
 * load-bearing for MyInvois: the digest is taken over the document with
 * `ext:UBLExtensions` removed, but the `xmlns:ext` declaration on the root
 * stays — LHDN canonicalizes the same way when it verifies, and a document
 * that drops the unused declaration hashes differently and is rejected. Using
 * exclusive c14n here would be a silent, and very hard to find, defect.
 *
 * ## The subset
 *
 * UBL documents are elements, attributes and text. There are no comments,
 * processing instructions, DTDs or entity references to canonicalize, so the
 * parts of the spec covering them are deliberately absent rather than
 * overlooked. Everything that *can* appear in a document this library builds
 * or parses is handled.
 *
 * ## Inter-element whitespace, and what that limits
 *
 * A real canonicalizer preserves whitespace *between* elements, because it is
 * text content. This node tree has none to preserve: `parse.ts` keeps text on
 * leaves only, so a pretty-printed document loses its indentation on the way
 * in and every document serialises compact on the way out.
 *
 * For signing, that costs nothing and is verified by `check:c14n` — we submit
 * compact bytes, and canonicalizing those compact bytes is exactly what this
 * produces. libxml2 agrees byte for byte.
 *
 * For *verifying someone else's* signature it is a real limit: given a
 * pretty-printed signed invoice, this recomputes a DocDigest over the document
 * without its whitespace, which is not what the original signer hashed. Any
 * future verify path has to canonicalize the received bytes rather than a
 * re-parse of them.
 */

/** Matches `xmlns` and `xmlns:prefix`, and nothing else. */
const NAMESPACE_DECLARATION = /^xmlns(?::|$)/;

/** Prefix to namespace URI. The default namespace is held under `''`. */
type NamespaceScope = Readonly<Record<string, string>>;

/**
 * Escape a text node (c14n11 §2.3).
 *
 * `>` is escaped in text even though XML does not require it, so that a
 * canonical document can never contain the `]]>` sequence. Carriage returns
 * become character references because an XML parser would otherwise normalise
 * them to line feeds, changing the bytes a verifier sees.
 */
function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#xD;');
}

/**
 * Escape an attribute value (c14n11 §2.3).
 *
 * Differs from text in both directions: `>` is left alone, `"` must be escaped
 * because canonical form always uses double quotes, and tab and line feed
 * become references so that attribute-value normalisation cannot rewrite them
 * to spaces on the way back in.
 */
function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/\t/g, '&#x9;')
    .replace(/\n/g, '&#xA;')
    .replace(/\r/g, '&#xD;');
}

/** `cac:Party` -> `cac`; an unprefixed name has the empty prefix. */
function prefixOf(name: string): string {
  const colon = name.indexOf(':');
  return colon === -1 ? '' : name.slice(0, colon);
}

/** `cac:Party` -> `Party`. */
function localOf(name: string): string {
  const colon = name.indexOf(':');
  return colon === -1 ? name : name.slice(colon + 1);
}

/**
 * Drop attributes the XML writer would not emit.
 *
 * `toXmlObject` filters falsy attribute values, so an empty `schemeID` never
 * reaches the output. The canonical form has to make the same choice: LHDN
 * canonicalizes the document it *receives*, so digesting an attribute that was
 * never submitted produces a DocDigest that cannot be reproduced.
 */
function present(attributes: XmlAttributes): Array<[string, string]> {
  return Object.entries(attributes)
    .filter(([, value]) => keepAttribute(value))
    .map(([name, value]): [string, string] => [name, String(value)]);
}

/**
 * Serialise one element's attributes, and return the namespace scope its
 * children inherit.
 *
 * Two groups, emitted in this order (c14n11 §2.4):
 *
 *  - namespace declarations, sorted by prefix, with the default namespace
 *    first. A declaration is omitted when it repeats the binding already in
 *    scope — re-declaring `xmlns:cac` on a child is invisible to a verifier.
 *  - every other attribute, sorted by namespace URI then local name. An
 *    unprefixed attribute has *no* namespace, not the default one, so it sorts
 *    under the empty URI and therefore ahead of any prefixed attribute.
 */
function renderAttributes(
  attributes: XmlAttributes,
  inherited: NamespaceScope,
): { rendered: string; scope: NamespaceScope } {
  const entries = present(attributes);
  const scope: Record<string, string> = { ...inherited };
  const declarations: Array<[string, string]> = [];

  entries.forEach(([name, value]) => {
    if (!NAMESPACE_DECLARATION.test(name)) return;
    const prefix = name === 'xmlns' ? '' : name.slice('xmlns:'.length);
    if (scope[prefix] === value) return;
    scope[prefix] = value;
    declarations.push([prefix, value]);
  });

  const plain = entries
    .filter(([name]) => !NAMESPACE_DECLARATION.test(name))
    .map(([name, value]): [string, string, string] => {
      const prefix = prefixOf(name);
      // An unprefixed attribute is in no namespace — the default xmlns does
      // not apply to attributes, only to elements.
      return [prefix === '' ? '' : (scope[prefix] ?? ''), localOf(name), `${name}="${escapeAttribute(value)}"`];
    });

  declarations.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  plain.sort(([aUri, aLocal], [bUri, bLocal]) => (aUri !== bUri ? (aUri < bUri ? -1 : 1) : aLocal < bLocal ? -1 : 1));

  const rendered = [
    ...declarations.map(([prefix, uri]) => `${prefix === '' ? 'xmlns' : `xmlns:${prefix}`}="${escapeAttribute(uri)}"`),
    ...plain.map(([, , text]) => text),
  ]
    .map((attribute) => ` ${attribute}`)
    .join('');

  return { rendered, scope };
}

/**
 * Append one element and its subtree.
 *
 * Empty elements are written as a start tag followed by an end tag; canonical
 * form has no self-closing shorthand.
 */
function appendElement(node: XmlNode, inherited: NamespaceScope, out: string[]): void {
  const { rendered, scope } = renderAttributes(node.attributes ?? {}, inherited);

  out.push(`<${node.name}${rendered}>`);

  if (node.value !== undefined && node.value !== null) {
    out.push(escapeText(String(node.value)));
  }
  (node.children ?? []).forEach((child) => appendElement(child, scope, out));

  out.push(`</${node.name}>`);
}

/**
 * Render a node tree as Canonical XML 1.1.
 *
 * No XML declaration: canonical form never has one, which is also what the
 * digest needs — a declaration carries an encoding that says nothing about the
 * document's content.
 */
export function toCanonicalXml(node: XmlNode): string {
  const out: string[] = [];
  appendElement(node, {}, out);
  return out.join('');
}
