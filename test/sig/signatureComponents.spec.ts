import { loadSchema } from '../../scripts/generator/schema';
import { parseXml } from '../../src/core/parse';
import { RawContent } from '../../src/core/rawContent';
import { UdtIdentifier } from '../../src/datatypes/udt';
import { SignatureInformation, UBLDocumentSignatures } from '../../src/sig';

/**
 * The gate for `src/sig`.
 *
 * check:schema, check:types and check:classref all scope themselves to
 * `src/cac`, so nothing in this directory is covered by them — which is
 * precisely how `src/ext/SignatureExtensions.ts` survived for years declaring
 * `cac:SignatureExtensions`, an element that appears nowhere in UBL 2.1, with
 * an empty params map. These two components are held to the schema here
 * instead, by the same loader the generators use.
 */
describe('sig: and sac: components', () => {
  const schema = loadSchema();

  const paramsOf = (component: {
    getParamsMap(): Record<string, { order: number; attributeName: string; max?: number }>;
  }) =>
    Object.values(component.getParamsMap())
      .sort((a, b) => a.order - b.order)
      .map(({ attributeName, max }) => ({ attributeName, max }));

  const schemaOf = (type: string) =>
    schema.types.get(type)!.children.map((child) => ({
      attributeName: child.name,
      max: child.maxOccurs === null ? undefined : child.maxOccurs,
    }));

  it('sig:UBLDocumentSignatures matches UBL-CommonSignatureComponents', () => {
    // sac:SignatureInformation is [1..*]; `max: undefined` is how this model
    // spells unbounded, and getting it wrong would silently cap a document at
    // one signature or reject the array outright.
    expect(paramsOf(new UBLDocumentSignatures({}))).toStrictEqual(schemaOf('sig:UBLDocumentSignaturesType'));
  });

  it('sac:SignatureInformation matches UBL-SignatureAggregateComponents', () => {
    // Element names and sequence positions both. UBL complex types are
    // xsd:sequence, and MyInvois rejects a wrong order as "Invalid Structure".
    expect(paramsOf(new SignatureInformation({}))).toStrictEqual(schemaOf('sac:SignatureInformationType'));
  });

  it('carries an opaque ds:Signature through unchanged', () => {
    // ds:Signature is xmldsig-core, not UBL, so it is held as RawContent. The
    // signature is a claim about bytes: anything that rewrites the subtree on
    // the way through invalidates it, so this asserts the exact rendering.
    const signature = new RawContent(
      parseXml('<ds:Signature Id="signature"><ds:SignatureValue>abc</ds:SignatureValue></ds:Signature>'),
    );

    const information = new SignatureInformation({
      id: 'urn:oasis:names:specification:ubl:signature:1',
      referencedSignatureID: 'urn:oasis:names:specification:ubl:signature:Invoice',
      signature,
    });

    expect(information.getAsXml(false, true)).toBe(
      '<sac:SignatureInformation>' +
        '<cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>' +
        '<sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>' +
        '<ds:Signature Id="signature"><ds:SignatureValue>abc</ds:SignatureValue></ds:Signature>' +
        '</sac:SignatureInformation>',
    );
  });

  it('nests one signature inside sig:UBLDocumentSignatures', () => {
    // The [1..*] child takes an array even for a single signature, which is
    // the arrangement that goes inside ext:ExtensionContent.
    //
    // An INSTANCE, not a plain params object. Every aggregate child in this
    // library works this way — buildClassInstance reads any object as
    // `{ content, attributes }`, so `{ id: '…' }` here silently produces an
    // empty <sac:SignatureInformation/>. The declared type is what stops it;
    // this test exists because the first draft of that type did not.
    const document = new UBLDocumentSignatures({
      signatureInformations: [new SignatureInformation({ id: 'urn:oasis:names:specification:ubl:signature:1' })],
    });

    expect(document.getAsXml(false, true)).toBe(
      '<sig:UBLDocumentSignatures>' +
        '<sac:SignatureInformation>' +
        '<cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>' +
        '</sac:SignatureInformation>' +
        '</sig:UBLDocumentSignatures>',
    );
  });

  it('accepts a UdtIdentifier as readily as a string', () => {
    const information = new SignatureInformation({ id: new UdtIdentifier('sig-1') });

    expect(information.getAsXml(false, true)).toBe(
      '<sac:SignatureInformation><cbc:ID>sig-1</cbc:ID></sac:SignatureInformation>',
    );
  });
});
