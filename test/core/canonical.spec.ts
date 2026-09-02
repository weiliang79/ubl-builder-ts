import { toXmlString } from '../../src/core/serialize';
import { XmlNode } from '../../src/core/xmlNode';

/**
 * Canonical XML 1.1, as MyInvois names it in the signature's first
 * `ds:Transform`.
 *
 * These assertions are the spec, not this implementation's habits: every one
 * states a rule from https://www.w3.org/TR/xml-c14n11/ that a verifier will
 * apply on the other side. A document that canonicalizes differently from
 * LHDN's own processor produces a DocDigest they cannot reproduce, and the
 * only symptom is a rejected invoice.
 */

const canonical = (node: XmlNode): string => toXmlString(node, { canonical: true });

describe('Canonical XML 1.1', () => {
  describe('document form', () => {
    it('writes an empty element as a start and end tag, never self-closing', () => {
      // c14n11 §2.3. `<a/>` and `<a></a>` are the same element to a parser and
      // different bytes to a hash, so canonical form allows only one.
      expect(canonical({ name: 'cbc:Note' })).toBe('<cbc:Note></cbc:Note>');
    });

    it('emits no XML declaration', () => {
      // A declaration states an encoding, which says nothing about content.
      // Canonical form omits it, and so must the bytes we digest.
      expect(canonical({ name: 'Invoice', value: 'x' })).toBe('<Invoice>x</Invoice>');
    });
  });

  describe('attribute order', () => {
    it('puts namespace declarations first, default namespace ahead of prefixes', () => {
      // c14n11 §2.4: namespace nodes precede attribute nodes, sorted by
      // prefix, and the default namespace sorts as the empty prefix.
      const node: XmlNode = {
        name: 'doc',
        attributes: { 'xmlns:b': 'urn:b', xmlns: 'urn:d', 'xmlns:a': 'urn:a' },
      };

      expect(canonical(node)).toBe('<doc xmlns="urn:d" xmlns:a="urn:a" xmlns:b="urn:b"></doc>');
    });

    it('sorts plain attributes by namespace URI then local name', () => {
      // An unprefixed attribute is in NO namespace — the default xmlns applies
      // to elements only — so it sorts under the empty URI, ahead of every
      // prefixed one however the prefixes compare.
      const node: XmlNode = {
        name: 'doc',
        attributes: { 'xmlns:b': 'urn:b', zeta: '1', alpha: '2', 'b:mid': '3' },
      };

      expect(canonical(node)).toBe('<doc xmlns:b="urn:b" alpha="2" zeta="1" b:mid="3"></doc>');
    });
  });

  describe('namespace scope', () => {
    it('omits a declaration that repeats the binding already in scope', () => {
      // Re-declaring the same prefix to the same URI is invisible to a reader,
      // so canonical form drops it. Our components declare namespaces on the
      // root, and a child that repeats one must not change the digest.
      const node: XmlNode = {
        name: 'Invoice',
        attributes: { 'xmlns:cac': 'urn:cac' },
        children: [{ name: 'cac:Party', attributes: { 'xmlns:cac': 'urn:cac' } }],
      };

      expect(canonical(node)).toBe('<Invoice xmlns:cac="urn:cac"><cac:Party></cac:Party></Invoice>');
    });

    it('keeps a declaration that rebinds a prefix to a different URI', () => {
      const node: XmlNode = {
        name: 'Invoice',
        attributes: { 'xmlns:x': 'urn:one' },
        children: [{ name: 'x:Inner', attributes: { 'xmlns:x': 'urn:two' } }],
      };

      expect(canonical(node)).toBe('<Invoice xmlns:x="urn:one"><x:Inner xmlns:x="urn:two"></x:Inner></Invoice>');
    });

    it('retains an in-scope namespace no element uses — c14n11 is not exclusive', () => {
      // This one is load-bearing for MyInvois. The DocDigest is taken over the
      // document with ext:UBLExtensions removed, which leaves xmlns:ext
      // declared and unused. Exclusive c14n would drop it; c14n11 keeps it,
      // and LHDN verifies assuming it is there. Getting this wrong yields a
      // document that validates, submits, and is rejected for a bad signature.
      const node: XmlNode = {
        name: 'Invoice',
        attributes: { 'xmlns:ext': 'urn:ext', 'xmlns:cbc': 'urn:cbc' },
        children: [{ name: 'cbc:ID', value: 'INV-1' }],
      };

      expect(canonical(node)).toBe('<Invoice xmlns:cbc="urn:cbc" xmlns:ext="urn:ext"><cbc:ID>INV-1</cbc:ID></Invoice>');
    });
  });

  describe('escaping', () => {
    it('escapes &, <, > and carriage return in text', () => {
      // `>` is escaped even though XML does not require it, so that canonical
      // output can never contain `]]>`. CR becomes a reference because a
      // parser would otherwise normalise it to LF and change the bytes.
      const node: XmlNode = { name: 'cbc:Note', value: 'a & b < c > d\r' };

      expect(canonical(node)).toBe('<cbc:Note>a &amp; b &lt; c &gt; d&#xD;</cbc:Note>');
    });

    it('escapes &, <, quote, tab, LF and CR in attributes — but not >', () => {
      // The rules differ from text in both directions: `"` must go because
      // canonical form always double-quotes, `>` may stay, and whitespace
      // becomes references so attribute-value normalisation cannot rewrite it
      // to spaces when the document is read back.
      const node: XmlNode = {
        name: 'doc',
        attributes: { note: 'a & b < c > d " e\t f\n g\r' },
      };

      expect(canonical(node)).toBe('<doc note="a &amp; b &lt; c > d &quot; e&#x9; f&#xA; g&#xD;"></doc>');
    });
  });

  describe('agreement with the ordinary writer', () => {
    it('keeps and drops exactly the attributes the XML writer does', () => {
      // LHDN canonicalizes the document it RECEIVES, so the two writers must
      // agree on which attributes exist. They share `keepAttribute` for that.
      //
      // An empty value is KEPT: XMLDSig's first ds:Reference carries `URI=""`,
      // meaning "this whole document", which is not the same as omitting the
      // attribute. The blanket truthiness test that used to live here dropped
      // it silently, and would have dropped a legitimate `0` too.
      const node: XmlNode = {
        name: 'cbc:ID',
        value: 'X',
        attributes: { schemeID: '', zero: 0, no: false, keep: 'yes' },
      };

      const expected = '<cbc:ID schemeID="" zero="0" no="false" keep="yes">X</cbc:ID>';
      expect(toXmlString(node, { headless: true })).toBe(expected);
      // Canonical form differs only in attribute order, which it sorts.
      expect(canonical(node)).toBe('<cbc:ID keep="yes" no="false" schemeID="" zero="0">X</cbc:ID>');
    });

    it('leaves ordinary serialisation untouched', () => {
      // Canonical mode is opt-in. Existing output — and the byte-identity the
      // parser tests assert — must not move because this file exists.
      const node: XmlNode = { name: 'cbc:Note' };

      expect(toXmlString(node, { headless: true })).toBe('<cbc:Note/>');
    });

    it('emits no whitespace between elements', () => {
      // Pinned deliberately, because it is the one place this diverges from a
      // DOM canonicalizer. Inter-element whitespace is text, and libxml2 keeps
      // it; this tree never holds any, since parse.ts keeps text on leaves
      // only. That is correct for signing — we submit compact bytes and digest
      // those same bytes, which check:c14n verifies against libxml2 — but it
      // means a pretty-printed document cannot be re-verified from a re-parse.
      const node: XmlNode = {
        name: 'Invoice',
        children: [
          { name: 'cbc:ID', value: '1' },
          { name: 'cbc:Note', value: '2' },
        ],
      };

      expect(canonical(node)).toBe('<Invoice><cbc:ID>1</cbc:ID><cbc:Note>2</cbc:Note></Invoice>');
    });
  });
});
