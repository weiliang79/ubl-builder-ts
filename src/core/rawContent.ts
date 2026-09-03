import { ParsedElement } from './parse';
import { NodeSource, XmlContent, XmlNode } from './xmlNode';

/**
 * An element this package models as opaque, carried through unchanged.
 *
 * `ext:ExtensionContent` is `xsd:any namespace="##other" processContents="lax"`
 * — arbitrary XML by definition, which is where MyInvois puts the XAdES
 * signature. There is no schema to derive a params map from, so a reader has
 * nothing to build a component out of and a writer has nothing to check.
 *
 * Holding the parsed subtree keeps a document that arrives with a signature
 * renderable exactly as it arrived, which is what byte-identity has to mean for
 * a document whose hash is computed over its bytes. Nothing here interprets the
 * content; it is the same nodes the parser read.
 */
export class RawContent implements NodeSource {
  constructor(private readonly element: ParsedElement) {}

  toNode(): XmlContent {
    return RawContent.contentOf(this.element);
  }

  private static contentOf(element: ParsedElement): XmlContent {
    const content: XmlContent = {};
    if (element.value !== undefined) content.value = element.value;
    if (Object.keys(element.attributes).length) content.attributes = { ...element.attributes };
    if (element.children.length) {
      content.children = element.children.map((child): XmlNode => ({
        name: child.name,
        ...RawContent.contentOf(child),
      }));
    }
    return content;
  }
}
