import { readFileSync } from 'fs';
import { join } from 'path';
import { Invoice } from '../../src/documents';

const XML_FIXTURE = join(__dirname, '..', 'fixtures', 'myinvois-invoice.xml');
const JSON_FIXTURE = join(__dirname, '..', 'fixtures', 'myinvois-invoice.json');

/**
 * Reading a document back is the first change in this series that adds
 * behaviour rather than correcting it, so the golden fixture stops being a
 * regression guard and becomes the specification: whatever comes out of
 * fromXml has to render back to the same 4542 bytes that went in.
 *
 * That is a stronger assertion than it looks. It covers element names, the
 * xsd:sequence order of every child, which children repeat, attributes on
 * leaves, the namespace declarations on the root, and the exact text of every
 * value — a single dropped `currencyID` or reordered element fails it.
 */
describe('reading a document back', () => {
  const xml = readFileSync(XML_FIXTURE, 'utf8');
  const json = JSON.parse(readFileSync(JSON_FIXTURE, 'utf8')) as Record<string, unknown>;

  it('round-trips the golden XML byte for byte', () => {
    expect(Invoice.fromXml(xml).getXml(false, true)).toBe(xml);
  });

  it('round-trips the golden JSON', () => {
    // The committed fixture, not one this test produced from the XML.
    expect(Invoice.fromJson(json).getJson()).toEqual(json);
  });

  it('reads JSON and renders the same XML', () => {
    // The JSON representation hoists the namespaces to _D/_A/_B/_E; putting
    // them back as root attributes is what makes this byte-identical rather
    // than merely equivalent.
    expect(Invoice.fromJson(json).getXml(false, true)).toBe(xml);
  });

  it('keeps attributes on leaf elements', () => {
    // cbc:InvoiceTypeCode/@listVersionID is how MyInvois carries the document
    // version, and every amount carries a currencyID the XSD requires.
    const back = Invoice.fromXml(xml).getXml(false, true);

    expect(back).toContain('<cbc:InvoiceTypeCode listVersionID="1.0">01</cbc:InvoiceTypeCode>');
    expect(back).toContain('currencyID="MYR"');
  });

  it('takes arity from the schema, not from the document', () => {
    // The fixture has one cac:InvoiceLine. A reader inferring "repeats" from
    // the parsed shape would store it as a single value, and a two-line
    // invoice would round-trip differently from a one-line one.
    const twoLines = xml.replace(
      /(<cac:InvoiceLine>.*<\/cac:InvoiceLine>)/,
      (line) => `${line}${line.replace('<cbc:ID>1</cbc:ID>', '<cbc:ID>2</cbc:ID>')}`,
    );

    expect(Invoice.fromXml(twoLines).getXml(false, true)).toBe(twoLines);
  });

  it('reports an element it cannot represent rather than dropping it', () => {
    // 32 UBL children still have no component class. Losing one silently on
    // the way through is the failure this whole series has been removing.
    const withUnknown = xml.replace('<cbc:IssueDate>', '<cbc:NotAUblElement>x</cbc:NotAUblElement><cbc:IssueDate>');

    expect(() => Invoice.fromXml(withUnknown)).toThrow(/NotAUblElement has no place/);
  });

  it('reports a single-valued element that appears twice', () => {
    // The second used to overwrite the first, so a malformed document lost a
    // value here and said nothing about it.
    const twice = xml.replace(
      '<cbc:IssueDate>2026-07-02</cbc:IssueDate>',
      '<cbc:IssueDate>2026-07-02</cbc:IssueDate><cbc:IssueDate>2026-07-03</cbc:IssueDate>',
    );

    expect(() => Invoice.fromXml(twice)).toThrow(/IssueDate appears more than once/);
  });

  it('round-trips a document that arrives pretty-printed', () => {
    // Element text is kept exactly as it arrives, whitespace included, which
    // is what byte-identity means for a document whose hash is computed over
    // its bytes. A container's text is never read — that would flatten every
    // descendant's text into the parent.
    expect(Invoice.fromXml(Invoice.fromXml(xml).getXml(true, true)).getXml(false, true)).toBe(xml);
  });

  it('round-trips ext:UBLExtensions', () => {
    // The one child whose subtree is free-form, and the one whose constructor
    // reset its own contents to [] immediately after storing them.
    const extensions =
      '<ext:UBLExtensions><ext:UBLExtension><ext:ExtensionURI>urn:x</ext:ExtensionURI></ext:UBLExtension></ext:UBLExtensions>';
    const cbc = 'xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"';
    const withExtensions = xml
      .replace('<cbc:ID>', `${extensions}<cbc:ID>`)
      .replace(cbc, `${cbc} xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"`);

    expect(Invoice.fromXml(withExtensions).getXml(false, true)).toBe(withExtensions);
  });

  it('rejects a document with no single root', () => {
    expect(() => Invoice.fromJson({ _D: 'urn:x' })).toThrow(/exactly one root element/);
  });
});
