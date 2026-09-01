import { create } from 'xmlbuilder2';

/**
 * The inverse of serialize.ts: bytes back to a neutral tree.
 *
 * Both dialects converge on {@link ParsedElement}, so everything above this
 * file rebuilds a document the same way whether it arrived as XML or as UBL
 * JSON. xmlbuilder2 appears here and in serialize.ts and nowhere else.
 */

/** One element: its name, text, attributes and element children. */
export interface ParsedElement {
  /** Qualified in XML (`cbc:ID`), bare in UBL JSON (`ID`). Match on {@link localName}. */
  name: string;
  /** Element text, absent for a container. */
  value?: string;
  attributes: Record<string, string>;
  children: ParsedElement[];
}

/** Strip a namespace prefix: `cbc:ID` -> `ID`. */
export function localName(name: string): string {
  const separator = name.indexOf(':');
  return separator === -1 ? name : name.slice(separator + 1);
}

/**
 * The slice of the DOM this file uses.
 *
 * Declared rather than imported: xmlbuilder2 exposes the node as its own DOM
 * implementation, and naming the three properties needed keeps that off the
 * public types.
 */
interface DomLike {
  nodeType: number;
  nodeName: string;
  textContent: string | null;
  childNodes: ArrayLike<DomLike>;
  attributes?: ArrayLike<{ name: string; value: string }>;
  documentElement?: DomLike;
}

const ELEMENT_NODE = 1;

function fromDom(node: DomLike): ParsedElement {
  const children = Array.from(node.childNodes)
    .filter((child) => child.nodeType === ELEMENT_NODE)
    .map(fromDom);

  const attributes: Record<string, string> = {};
  Array.from(node.attributes ?? []).forEach((attribute) => {
    attributes[attribute.name] = attribute.value;
  });

  // Text belongs to a leaf. A container's textContent is the concatenation of
  // everything under it, which would turn <cac:Party> into a string of every
  // descendant's text run together.
  const element: ParsedElement = { name: node.nodeName, attributes, children };
  if (children.length === 0 && node.textContent !== null && node.textContent !== '') {
    element.value = node.textContent;
  }
  return element;
}

/**
 * Read an XML document.
 *
 * Walks the DOM rather than xmlbuilder2's object dialect, which collapses a
 * text-only element to a bare string and leaves a lone repeatable element
 * unwrapped — two shapes that cannot be told apart from a container or a
 * single-valued one without consulting the schema anyway.
 */
export function parseXml(xml: string): ParsedElement {
  const document = create(xml).node as unknown as DomLike;
  const root = document.documentElement;
  if (!root) throw new Error('the document has no root element');
  return fromDom(root);
}

/**
 * The document-level namespace keys, and the attribute each came from.
 *
 * The inverse of the `_D` / `_A` / `_B` / `_E` hoisting in serialize.ts. Put
 * back as attributes on the root so a document read from JSON carries the
 * namespaces it arrived with, and renders as XML without a profile having to
 * re-supply them.
 */
const NAMESPACE_ATTRIBUTE: Record<string, string> = {
  _D: 'xmlns',
  _A: 'xmlns:cac',
  _B: 'xmlns:cbc',
  _E: 'xmlns:ext',
};

function fromJsonValue(name: string, value: Record<string, unknown>): ParsedElement {
  const attributes: Record<string, string> = {};
  const children: ParsedElement[] = [];

  Object.entries(value).forEach(([key, entry]) => {
    if (key === '_') return;
    if (Array.isArray(entry)) {
      entry.forEach((item) => children.push(fromJsonValue(key, item as Record<string, unknown>)));
      return;
    }
    attributes[key] = String(entry);
  });

  const element: ParsedElement = { name, attributes, children };
  if (value._ !== undefined && value._ !== null) element.value = String(value._);
  return element;
}

/**
 * Read an OASIS UBL JSON (Alternative Representation v2.0) document.
 *
 * The shape {@link toUblJson} writes: every element is an array, content sits
 * under `_`, attributes are siblings, and the namespaces are hoisted to `_D` /
 * `_A` / `_B` / `_E`. Those four come back as root attributes.
 *
 * The representation carries only those four, so a document that was XML first
 * loses any others it had — `xmlns:ds`, `xmlns:xades`, `xsi:schemaLocation`.
 * That is a property of the format, not of this reader: they were gone the
 * moment it became JSON.
 */
export function parseUblJson(document: Record<string, unknown>): ParsedElement {
  const roots = Object.entries(document).filter(([key]) => !(key in NAMESPACE_ATTRIBUTE));
  if (roots.length !== 1) {
    throw new Error(`expected exactly one root element, found ${roots.length || 'none'}`);
  }

  const [name, value] = roots[0];
  const instances = Array.isArray(value) ? value : [value];
  const element = fromJsonValue(name, instances[0] as Record<string, unknown>);

  Object.entries(NAMESPACE_ATTRIBUTE).forEach(([key, attribute]) => {
    const uri = document[key];
    if (typeof uri === 'string') element.attributes[attribute] = uri;
  });

  return element;
}
