/**
 * The neutral intermediate representation.
 *
 * Components describe themselves as plain nodes; how those nodes become bytes
 * is decided in `serialize.ts`. Keeping the two apart is what allows one
 * document model to render as XML or as OASIS UBL JSON, and it keeps a third
 * party's serialization dialect out of the domain classes.
 */

export type XmlAttributes = Record<string, string | number | boolean>;

/**
 * What an element contains: a value, attributes, children — but not its own
 * name.
 *
 * The name is deliberately absent. In UBL an element's name is decided by
 * where it sits, not by what it is: one PeriodType is `cac:InvoicePeriod`
 * under Invoice and `cac:ValidityPeriod` under Price. Only the parent knows,
 * so only the parent supplies it.
 */
export interface XmlContent {
  value?: string | number | boolean;
  attributes?: XmlAttributes;
  children?: XmlNode[];
}

/** Content together with the name it appears under. */
export interface XmlNode extends XmlContent {
  name: string;
  /**
   * This element is one of a repeating set (UBL maxOccurs > 1).
   *
   * Serializers need it even when only one instance is present: the XML
   * dialect groups repeats into an array, and the OASIS UBL JSON
   * representation requires every element to be a list regardless of count.
   */
  repeats?: boolean;
}

/** Anything that can describe itself as a node. */
export interface NodeSource {
  toNode(): XmlContent;
}

/**
 * Whether an attribute reaches the output.
 *
 * `undefined` and `null` mean "not set" and are dropped; everything else is
 * written, the empty string included. That last part matters: XMLDSig's first
 * `ds:Reference` carries `URI=""`, which means "this whole document" and is
 * *not* the same as omitting the attribute — omitted, a verifier is told the
 * data is identified some other way. A blanket truthiness test silently
 * dropped it, and would drop a legitimate `0` too.
 *
 * `false` is kept for the same reason: `someIndicator="false"` is a statement,
 * not an absence.
 *
 * It lives here rather than in serialize.ts because both writers need it and
 * xmlNode.ts is the module neither of them can cycle through.
 */
export function keepAttribute(value: string | number | boolean | undefined | null): boolean {
  return value !== undefined && value !== null;
}
