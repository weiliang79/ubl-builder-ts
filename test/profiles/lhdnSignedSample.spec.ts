import { createHash, createVerify, X509Certificate } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ParsedElement, parseXml } from '../../src/core/parse';
import { toXmlString } from '../../src/core/serialize';
import { XmlNode } from '../../src/core/xmlNode';

/**
 * Our signing procedure, checked against LHDN's own signed reference document.
 *
 * `test/fixtures/lhdn/one-doc-signed.xml` is a signed UBL 2.1 invoice published
 * by LHDN, carrying real digests and a real signature from Pos Digicert's
 * "Trial LHDNM Sub CA V1". The suite in `myinvoisSign.spec.ts` proves this
 * library is self-consistent; this file is the only evidence available offline
 * that it agrees with the party doing the validating.
 *
 * The document proves its own provenance: a fabricated sample would not verify
 * against a real certificate chain.
 *
 * ## What it settles
 *
 * Three things that were reconstructed from other implementations are now
 * measured against LHDN's own output — see the individual tests. The fourth,
 * the properties digest, does not reproduce; that is documented at the bottom
 * rather than papered over.
 *
 * ## It is NOT in test/fixtures/ with the others, deliberately
 *
 * `validate:xsd` would fail on it. The certificate's serial number,
 * 162880276254639189035871514749820882117, is a perfectly legal `xs:integer`
 * — the type is unbounded — but libxml2 rejects anything past a machine
 * integer. Verified directly: the same 39-digit value fails a minimal schema
 * where a 5-digit one passes.
 *
 * Worth knowing beyond this file: real X.509 serial numbers are routinely
 * 128-bit, so `validate:xsd` cannot check a genuinely signed document. The XSD
 * assertion in `myinvoisSign.spec.ts` passes only because its fake certificate
 * has a short serial.
 */

const SAMPLE = join(__dirname, '..', 'fixtures', 'lhdn', 'one-doc-signed.xml');

/** Local name only: LHDN's sample writes `UBLExtensions` under a default-namespace override where this library emits `ext:UBLExtensions`. Same element to a parser. */
const local = (name: string): string => (name.includes(':') ? name.split(':')[1] : name);

const toNode = (element: ParsedElement): XmlNode => ({
  name: element.name,
  ...(element.value !== undefined ? { value: element.value } : {}),
  attributes: element.attributes,
  children: element.children.map(toNode),
});

/** The transform the first ds:Reference declares, matched on local names. */
const applyTransform = (node: XmlNode): XmlNode => ({
  ...node,
  children: (node.children ?? [])
    .filter((child) => !['UBLExtensions', 'Signature'].includes(local(child.name)))
    .map(applyTransform),
});

const find = (node: XmlNode, name: string): XmlNode | undefined =>
  local(node.name) === name
    ? node
    : (node.children ?? []).reduce<XmlNode | undefined>((hit, child) => hit ?? find(child, name), undefined);

const textOf = (node: XmlNode | undefined): string => String(node?.value ?? '');
const sha256 = (content: string): string => createHash('sha256').update(content, 'utf8').digest('base64');

describe("LHDN's published signed sample", () => {
  const root = toNode(parseXml(readFileSync(SAMPLE, 'utf8')));
  const canonicalDocument = toXmlString(applyTransform(root), { canonical: true });

  const digestValues: string[] = [];
  (function collect(node: XmlNode) {
    if (local(node.name) === 'DigestValue') digestValues.push(textOf(node));
    (node.children ?? []).forEach(collect);
  })(root);

  it('reproduces the DocDigest LHDN published', () => {
    // Canonicalization AND the transform, measured end to end against a value
    // this project did not compute. Before this, the strongest claim available
    // was "agrees with libxml2", which says nothing about whether the right
    // bytes were fed to it.
    expect(sha256(canonicalDocument)).toBe(digestValues[0]);
  });

  it('shows the document is canonicalized non-exclusively, whatever the sample says about itself', () => {
    // The sample declares Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"
    // on both its CanonicalizationMethod and its third Transform. That is
    // wrong about its own content: exclusive c14n yields a different digest,
    // and the published value is the non-exclusive one. LHDN's documentation
    // and klsheng's implementation both say c14n11; the sample's attribute is
    // the outlier. Do not "fix" canonical.ts toward exclusive c14n.
    const declared = textOf(find(root, 'CanonicalizationMethod'));
    expect(find(root, 'CanonicalizationMethod')?.attributes?.Algorithm).toBe('http://www.w3.org/2001/10/xml-exc-c14n#');
    expect(declared).toBe('');
    expect(sha256(canonicalDocument)).toBe(digestValues[0]);
  });

  it('confirms the signature covers the document, not ds:SignedInfo', () => {
    // The first and least standard of the deviations, verified against a real
    // LHDN signature rather than inferred from another implementation.
    const certificate = new X509Certificate(Buffer.from(textOf(find(root, 'X509Certificate')), 'base64'));
    const verified = createVerify('RSA-SHA256')
      .update(Buffer.from(canonicalDocument, 'utf8'))
      .verify(certificate.publicKey, Buffer.from(textOf(find(root, 'SignatureValue')), 'base64'));

    expect(verified).toBe(true);
  });

  it('derives CertDigest as SHA-256 over the DER of the embedded certificate', () => {
    const der = Buffer.from(textOf(find(root, 'X509Certificate')), 'base64');
    expect(createHash('sha256').update(der).digest('base64')).toBe(digestValues[2]);
  });

  it('renders X509IssuerName in RFC 4514 order — the reverse of OpenSSL', () => {
    // This is the DS326 rejection. `issuerName` is a caller-supplied string in
    // SigningOptions precisely because there is no canonical ordering to parse
    // out; this pins down which order LHDN actually wants.
    const certificate = new X509Certificate(Buffer.from(textOf(find(root, 'X509Certificate')), 'base64'));
    const published = textOf(find(root, 'X509IssuerName'));

    expect(published).toBe('CN=Trial LHDNM Sub CA V1, OU=Terms of use at http://www.posdigicert.com.my, O=LHDNM, C=MY');
    // OpenSSL hands back the same RDNs in the opposite order.
    expect(certificate.issuer.split('\n').reverse().join(', ')).toBe(published);
  });

  it("does not reproduce the sample's PropsDigest — an open question, not a passing test", () => {
    // Documented rather than hidden. Sixteen candidate inputs were tried:
    // QualifyingProperties and SignedProperties, bare, with xmlns:xades, with
    // both namespaces, under c14n11 and exclusive c14n, pretty and compact,
    // plus every literal element span in the file under five normalisations.
    // None produce the published value.
    //
    // The element choice is not the problem. LHDN's signed JSON sample digests
    // `QualifyingProperties` — the Target wrapper — and that value reproduces
    // exactly, while the bare `SignedProperties` does not. So the wrapper is
    // right and the XML *serialisation* of it is what remains unknown.
    //
    // Note what is NOT at stake: in this scheme SignatureValue signs the
    // document, so nothing cryptographically binds this digest. A stale value
    // in the sample would still verify — which is one explanation for why the
    // other three reproduce and this one does not.
    //
    // The implementation follows klsheng, which is in production. This test
    // asserts the mismatch so that a future change which happens to fix it
    // fails loudly and gets investigated, instead of passing unnoticed.
    const properties = find(root, 'QualifyingProperties') as XmlNode;
    const bare = (node: XmlNode): XmlNode => ({
      ...node,
      attributes: Object.fromEntries(Object.entries(node.attributes ?? {}).filter(([key]) => !key.startsWith('xmlns'))),
      children: (node.children ?? []).map(bare),
    });

    expect(sha256(toXmlString(bare(properties), { canonical: true }))).not.toBe(digestValues[1]);
    expect(digestValues[1]).toBe('Tc9oNX8EuNQohWVDZeaPOHmeBU5tuwVdwIRyfltnTPw=');
  });
});
