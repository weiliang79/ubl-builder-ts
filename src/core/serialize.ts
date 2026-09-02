import { create } from 'xmlbuilder2';
import { toCanonicalXml } from './canonical';
import { keepAttribute, XmlContent, XmlNode } from './xmlNode';

/**
 * The only place that knows a serialization dialect.
 *
 * Everything above this file speaks XmlNode; xmlbuilder2 appears here and
 * nowhere else.
 */

export interface XmlOptions {
  /** Pretty-print the output. */
  pretty?: boolean;
  /** Omit the XML declaration. */
  headless?: boolean;
  /**
   * Emit Canonical XML 1.1 — the form a signature is computed over.
   *
   * Overrides `pretty` and `headless`, which canonical form fixes: never
   * indented, never with a declaration. This is what MyInvois names as
   * `xml-c14n11`; see `canonical.ts`. Ordinary output is unaffected, so a
   * document serialises to the same bytes it always did.
   */
  canonical?: boolean;
}

/**
 * Convert a node tree to xmlbuilder2's object dialect: `#` carries text,
 * `@` prefixes attributes, and repeated element names become arrays.
 *
 * Repeated names are grouped rather than interleaved, which is safe because
 * UBL complex types are xsd:sequence — elements sharing a name are always
 * contiguous.
 */
export function toXmlObject(content: XmlContent): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (content.value !== undefined && content.value !== null) {
    out['#'] = content.value;
  }

  Object.entries(content.attributes ?? {})
    .filter(([, value]) => keepAttribute(value))
    .forEach(([name, value]) => {
      out[`@${name}`] = value;
    });

  (content.children ?? []).forEach((child) => {
    const converted = toXmlObject(child);
    if (child.name in out) {
      const existing = out[child.name];
      out[child.name] = Array.isArray(existing) ? [...existing, converted] : [existing, converted];
    } else {
      out[child.name] = child.repeats ? [converted] : converted;
    }
  });

  return out;
}

/** Render a named node as an XML document. */
export function toXmlString(
  node: XmlNode,
  { pretty = false, headless = false, canonical = false }: XmlOptions = {},
): string {
  if (canonical) return toCanonicalXml(node);

  const document = { [node.name]: toXmlObject(node) };

  return create({ version: '1.0', encoding: 'UTF-8', standalone: false }, document).end({
    headless,
    prettyPrint: pretty,
  });
}

/**
 * OASIS UBL JSON Alternative Representation, version 2.0 (cnd01) — the
 * revision the MyInvois SDK names.
 *
 * Do not confuse it with v1.0, which is incompatible: v1.0 uses type-specific
 * content keys (`AmountContent`, `AmountCurrencyIdentifier`), where v2.0 uses
 * `_` for content with plain attribute names alongside it.
 *
 * Three rules define the shape:
 *  - every element is an array, addressable at [0], however many there are
 *  - element content sits under `_`
 *  - attributes become sibling properties under their own names
 *
 * Element names lose their prefix. `cbc:ID` becomes `ID`, `cac:Party` becomes
 * `Party`; the namespaces move to the document's `_D` / `_A` / `_B` / `_E`
 * keys, and a reader recovers which applies from whether the property is a
 * basic or an aggregate component.
 */

/** Namespace URIs for the document's `_D` / `_A` / `_B` / `_E` keys. */
export interface UblJsonNamespaces {
  /** _D — the document type's own namespace. */
  document?: string;
  /** _A — aggregate components (cac). */
  aggregate?: string;
  /** _B — basic components (cbc). */
  basic?: string;
  /** _E — extensions (ext), when present. */
  extension?: string;
}

const XMLNS_TO_KEY: Record<string, keyof UblJsonNamespaces> = {
  xmlns: 'document',
  'xmlns:cac': 'aggregate',
  'xmlns:cbc': 'basic',
  'xmlns:ext': 'extension',
};

const NAMESPACE_KEY: Record<keyof UblJsonNamespaces, string> = {
  document: '_D',
  aggregate: '_A',
  basic: '_B',
  extension: '_E',
};

/** Strip a namespace prefix: `cbc:ID` -> `ID`. */
function localName(name: string): string {
  const separator = name.indexOf(':');
  return separator === -1 ? name : name.slice(separator + 1);
}

/** Convert node content to the v2.0 object shape. */
export function toJsonObject(content: XmlContent): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (content.value !== undefined && content.value !== null) {
    out._ = content.value;
  }

  Object.entries(content.attributes ?? {})
    .filter(([name, value]) => value && !(name in XMLNS_TO_KEY))
    .forEach(([name, value]) => {
      out[name] = value;
    });

  (content.children ?? []).forEach((child) => {
    const key = localName(child.name);
    const converted = toJsonObject(child);
    const existing = out[key] as unknown[] | undefined;
    if (existing) {
      existing.push(converted);
    } else {
      out[key] = [converted];
    }
  });

  return out;
}

/**
 * Render a named node as a UBL JSON document.
 *
 * Namespaces are read from the root's `xmlns` attributes unless supplied
 * explicitly, so a document built for XML output needs no extra setup.
 *
 * Values are emitted exactly as held. This library stores amounts as strings
 * — `'90.00'` rather than `90` — because trailing zeros are significant in
 * XML and converting would lose them. A profile that needs numeric JSON
 * should coerce them; the core will not guess.
 */
export function toUblJson(node: XmlNode, namespaces: UblJsonNamespaces = {}): Record<string, unknown> {
  const resolved: UblJsonNamespaces = { ...namespaces };

  Object.entries(node.attributes ?? {}).forEach(([name, value]) => {
    const key = XMLNS_TO_KEY[name];
    if (key && resolved[key] === undefined) {
      resolved[key] = String(value);
    }
  });

  const document: Record<string, unknown> = {};
  (Object.keys(NAMESPACE_KEY) as (keyof UblJsonNamespaces)[]).forEach((key) => {
    if (resolved[key]) {
      document[NAMESPACE_KEY[key]] = resolved[key];
    }
  });

  document[localName(node.name)] = [toJsonObject(node)];
  return document;
}
