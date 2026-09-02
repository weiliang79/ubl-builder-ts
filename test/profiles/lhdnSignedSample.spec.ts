import { spawnSync } from 'node:child_process';
import { createHash, createVerify, X509Certificate } from 'node:crypto';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

  /**
   * The published digest a given Reference carries, located structurally.
   *
   * By URI rather than by position: `[0]`, `[1]`, `[2]` over every DigestValue
   * in the document happens to be right here, but it encodes reading order
   * rather than meaning, and silently picks a different value if the document
   * ever gains an element.
   */
  const referenceDigest = (uri: string): string => {
    const reference = (find(root, 'SignedInfo')?.children ?? []).find(
      // `URI` must be PRESENT and equal — not defaulted. An absent URI and
      // `URI=""` are different claims in XMLDSig, which is the distinction the
      // serializer had to be fixed for; a lookup that conflates them would
      // undercut the branch it is testing.
      (child) =>
        local(child.name) === 'Reference' &&
        child.attributes?.URI !== undefined &&
        String(child.attributes.URI) === uri,
    );
    if (!reference) throw new Error(`no ds:Reference with URI="${uri}" in the sample`);
    return textOf(find(reference, 'DigestValue'));
  };
  const documentDigest = referenceDigest('');
  const propertiesDigest = referenceDigest('#id-xades-signed-props');
  const certificateDigest = textOf(find(find(root, 'CertDigest') as XmlNode, 'DigestValue'));

  it('reproduces the DocDigest LHDN published', () => {
    // Canonicalization AND the transform, measured end to end against a value
    // this project did not compute. Before this, the strongest claim available
    // was "agrees with libxml2", which says nothing about whether the right
    // bytes were fed to it.
    expect(sha256(canonicalDocument)).toBe(documentDigest);
  });

  it('shows the document is canonicalized non-exclusively, whatever the sample says about itself', () => {
    // The sample declares Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"
    // on both its CanonicalizationMethod and its third Transform, and is wrong
    // about its own content — the published digest is the NON-exclusive one.
    //
    // Demonstrated rather than asserted: this canonicalizes our c14n11 output
    // again, exclusively, via libxml2. Exclusive c14n drops in-scope namespace
    // declarations nothing uses — which after the transform is exactly
    // xmlns:ext — so the bytes and the digest must differ. An earlier draft of
    // this test named the claim without computing it, and would have passed
    // even if the two algorithms agreed.
    expect(find(root, 'CanonicalizationMethod')?.attributes?.Algorithm).toBe('http://www.w3.org/2001/10/xml-exc-c14n#');

    if (spawnSync('xmllint', ['--version']).error) {
      console.warn('xmllint not installed — skipping the exclusive-c14n comparison');
      return;
    }

    const file = join(tmpdir(), `ubl-c14n-${process.pid}.xml`);
    writeFileSync(file, canonicalDocument);
    try {
      const exclusive = spawnSync('xmllint', ['--exc-c14n', file], { encoding: 'utf8' });
      expect(exclusive.status).toBe(0);
      expect(exclusive.stdout).not.toBe(canonicalDocument);
      expect(sha256(exclusive.stdout)).not.toBe(documentDigest);
      // …while ours does match, so the difference is decided, not merely noted.
      expect(sha256(canonicalDocument)).toBe(documentDigest);
    } finally {
      unlinkSync(file);
    }
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
    expect(createHash('sha256').update(der).digest('base64')).toBe(certificateDigest);
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
    // Documented rather than hidden, and the search behind it was exhaustive.
    //
    // Candidate inputs tried: QualifyingProperties and SignedProperties, each
    // bare, with xmlns:xades, with xmlns:ds, and with both in either order;
    // under c14n11 and exclusive c14n; pretty and compact; with self-closing
    // tags left, tightened and expanded; and with whitespace treated four ways
    // including klsheng's "linearize" (strip \n \t \r only, leaving space
    // indentation). Then, to stop guessing: every substring of the file that
    // starts at a `<` and ends after a `>` between 300 and 4000 bytes long,
    // under three normalisations — 133,467 of them. Nothing matches.
    //
    // So this digest is not derivable from the published bytes at all, which
    // is a different finding from "we compute it wrong". The other three
    // values reproduce exactly; this one reproduces from nothing.
    //
    // Note what is NOT at stake: SignatureValue signs the document, not
    // ds:SignedInfo, so nothing cryptographically binds this digest. A stale
    // value here would never have been caught — and the sample is already
    // demonstrably wrong about its own canonicalization algorithm.
    //
    // The element choice is separately evidenced: LHDN's signed JSON sample
    // digests QualifyingProperties, the Target wrapper, and that value
    // reproduces exactly while bare SignedProperties does not.
    //
    // DS320 is the one signal that could still overturn this — see
    // `digestedProperties` in profiles/myinvois/sign.ts. This test asserts the
    // mismatch so that a change which happens to fix it fails loudly.
    const properties = find(root, 'QualifyingProperties') as XmlNode;
    const bare = (node: XmlNode): XmlNode => ({
      ...node,
      attributes: Object.fromEntries(Object.entries(node.attributes ?? {}).filter(([key]) => !key.startsWith('xmlns'))),
      children: (node.children ?? []).map(bare),
    });

    expect(sha256(toXmlString(bare(properties), { canonical: true }))).not.toBe(propertiesDigest);
    expect(propertiesDigest).toBe('Tc9oNX8EuNQohWVDZeaPOHmeBU5tuwVdwIRyfltnTPw=');
  });
});
