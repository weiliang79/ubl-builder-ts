import { spawnSync } from 'node:child_process';
import { createSign, createVerify, generateKeyPairSync } from 'node:crypto';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { toXmlString } from '../../src/core/serialize';
import { XmlNode } from '../../src/core/xmlNode';
import { Invoice } from '../../src/documents';
import { myInvois, Signer, signInvoice } from '../../src/profiles/myinvois';
import { SHA256 } from '../../src/signing/digest';

/**
 * MyInvois XAdES signing, checked by recomputation rather than by constants.
 *
 * A test that asserts the digest equals a string this file also wrote proves
 * only that the code is self-consistent. What matters is whether LHDN can
 * reproduce these values from the document it receives, so every assertion
 * here re-derives the value the way a verifier would: read the emitted
 * document, apply the declared transform, canonicalize, digest, compare.
 *
 * What this canNOT prove is that LHDN agrees with the procedure. Two
 * deviations from standard XMLDSig are reconstructed from
 * klsheng/myinvois-php-sdk and corroborated by @ibnumalik/myinvois — see
 * `sign.ts`. Only a sandbox submission settles that.
 */

const FIXTURE = join(__dirname, '..', 'fixtures', 'myinvois-invoice.xml');
const sha256 = new SHA256();

/** The signer a caller supplies: bytes in, raw RSA signature out. */
function rsaSigner(privateKey: Parameters<typeof createSign>[0] extends never ? never : any): Signer {
  return (bytes) => {
    const signer = createSign('RSA-SHA256');
    signer.update(Buffer.from(bytes));
    return new Uint8Array(signer.sign(privateKey));
  };
}

/**
 * Independently reimplemented from the ds:Transform XPaths, deliberately —
 * importing the library's own copy would make the test agree with itself.
 */
function applyTransform(node: XmlNode): XmlNode {
  const excluded = new Set(['ext:UBLExtensions', 'cac:Signature']);
  return {
    ...node,
    children: (node.children ?? []).filter((child) => !excluded.has(child.name)).map(applyTransform),
  };
}

const find = (node: XmlNode, name: string): XmlNode | undefined => {
  if (node.name === name) return node;
  for (const child of node.children ?? []) {
    const hit = find(child, name);
    if (hit) return hit;
  }
  return undefined;
};

const textOf = (node: XmlNode | undefined): string => String(node?.value ?? '');

describe('MyInvois XAdES signing', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const certificate = {
    // The library never parses a certificate — the caller supplies these,
    // which is what keeps Web Crypto sufficient and the package browser-safe.
    base64: 'TUlJRkFLRQ==',
    issuerName: 'CN=Test CA, E=ca@example.my, OU=Certification, O=Example Sdn Bhd, C=MY',
    serialNumber: '1234567890',
    der: new Uint8Array([1, 2, 3, 4, 5]),
  };

  const signOne = async () => {
    const invoice = Invoice.fromXml(readFileSync(FIXTURE, 'utf8'));
    const signed = await signInvoice(invoice, {
      sign: rsaSigner(privateKey),
      certificate,
      signingTime: new Date('2026-09-02T08:30:00.000Z'),
    });
    return { invoice, signed, emitted: invoice.toNode() };
  };

  it('bumps listVersionID to 1.1 before digesting, not after', () => {
    // The trap ibnumalik documented: anything that changes the document after
    // step 2 gives LHDN a different DocDigest. Signing owns the bump, so the
    // ordering cannot be got wrong by a caller.
    return signOne().then(({ signed, emitted }) => {
      expect(find(emitted, 'cbc:InvoiceTypeCode')?.attributes?.listVersionID).toBe('1.1');
      // …and the bytes that were signed already carried it.
      expect(signed).toContain('listVersionID="1.1"');
    });
  });

  it('produces a DocDigest a verifier can recompute from the emitted document', async () => {
    const { emitted } = await signOne();

    const recomputed = await sha256.getHash(
      toXmlString(applyTransform(emitted), { canonical: true }),
      'utf8',
      'base64',
    );

    const reference = (find(emitted, 'ds:SignedInfo')?.children ?? []).find((c) => c.name === 'ds:Reference');
    expect(textOf(find(reference as XmlNode, 'ds:DigestValue'))).toBe(recomputed);
  });

  it('produces a PropsDigest a verifier can recompute from the emitted properties', async () => {
    const { emitted } = await signOne();

    const properties = find(emitted, 'xades:QualifyingProperties') as XmlNode;
    const recomputed = await sha256.getHash(toXmlString(properties, { canonical: true }), 'utf8', 'base64');

    const references = (find(emitted, 'ds:SignedInfo')?.children ?? []).filter((c) => c.name === 'ds:Reference');
    expect(textOf(find(references[1], 'ds:DigestValue'))).toBe(recomputed);
  });

  it('signs the document bytes, which is what LHDN verifies — not ds:SignedInfo', async () => {
    // The deviation from standard XMLDSig, asserted rather than assumed: the
    // signature verifies over the canonical transformed document.
    const { signed, emitted } = await signOne();

    const verifier = createVerify('RSA-SHA256');
    verifier.update(Buffer.from(signed, 'utf8'));

    expect(verifier.verify(publicKey, Buffer.from(textOf(find(emitted, 'ds:SignatureValue')), 'base64'))).toBe(true);
  });

  it('digests the qualifying properties with no namespace declarations on them', async () => {
    // klsheng canonicalizes under a synthetic root and strips it textually,
    // leaving a fragment that declares nothing. Reproduced here by simply not
    // declaring them; xmlns:xades lives on ds:Object instead.
    const { emitted } = await signOne();
    const properties = find(emitted, 'xades:QualifyingProperties') as XmlNode;

    expect(Object.keys(properties.attributes ?? {})).toStrictEqual(['Target']);
    expect(find(emitted, 'ds:Object')?.attributes?.['xmlns:xades']).toBe('http://uri.etsi.org/01903/v1.3.2#');
  });

  it('declares the signature namespaces on the root before hashing', async () => {
    // c14n11 is non-exclusive, so these survive on the root of the transformed
    // document even though nothing left in it uses them. Signer and verifier
    // agree only if they were there when the digest was taken.
    const { signed } = await signOne();

    expect(signed).toContain('xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"');
    expect(signed).toContain('xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2"');
    expect(signed).not.toContain('<ext:UBLExtensions>');
    expect(signed).not.toContain('<cac:Signature>');
  });

  it('survives a round trip through fromXml unchanged', async () => {
    // A signature is a claim about bytes. RawContent carries ds:Signature
    // through without interpreting it, so reading a signed document back and
    // rendering it must reproduce it exactly — otherwise the hash we submit
    // and the hash we could recompute would differ.
    const { invoice } = await signOne();
    const xml = invoice.getXml(false, true);

    expect(Invoice.fromXml(xml).getXml(false, true)).toBe(xml);
  });

  it('emits a document that still validates against the UBL 2.1 schema', async () => {
    // The structural check the unit assertions cannot make. OASIS ships the
    // xmldsig-core and XAdES schemas as part of UBL 2.1, so the XSD covers the
    // whole signature tree — a misplaced element or a wrong attribute name
    // fails here and nowhere else.
    //
    // Skipped rather than failed when xmllint is absent: CI installs it, and a
    // contributor without libxml2 should not see a red suite they cannot fix.
    if (spawnSync('xmllint', ['--version']).error) {
      console.warn('xmllint not installed — skipping XSD validation of the signed document');
      return;
    }

    const { invoice } = await signOne();
    const file = join(tmpdir(), `ubl-signed-${process.pid}.xml`);
    writeFileSync(file, invoice.getXml(true, false));

    try {
      const schema = join(__dirname, '..', '..', 'schemas', 'ubl', '2.1', 'maindoc', 'UBL-Invoice-2.1.xsd');
      const result = spawnSync('xmllint', ['--noout', '--schema', schema, file], { encoding: 'utf8' });
      expect(result.stderr.trim()).toBe(`${file} validates`);
      expect(result.status).toBe(0);
    } finally {
      unlinkSync(file);
    }
  });

  it('carries URI="" on the document reference, which is not the same as omitting it', async () => {
    // XMLDSig: URI="" means "this whole document"; an absent URI tells a
    // verifier the data is identified some other way. The serializer used to
    // drop every falsy attribute and silently swallowed this one.
    const { emitted } = await signOne();
    const reference = (find(emitted, 'ds:SignedInfo')?.children ?? []).find((c) => c.name === 'ds:Reference');

    expect(reference?.attributes?.URI).toBe('');
  });

  it('refuses to sign a document with no InvoiceTypeCode', async () => {
    // MyInvois carries the document version there, so signing cannot set 1.1
    // and the digest would cover a document LHDN reads as unsigned.
    await expect(signInvoice(new Invoice('INV-1'), { sign: rsaSigner(privateKey), certificate })).rejects.toThrow(
      /InvoiceTypeCode/,
    );
  });

  it('exposes signing through myInvois.withSigner', async () => {
    const profile = myInvois.withSigner({ sign: rsaSigner(privateKey), certificate });
    const invoice = Invoice.fromXml(readFileSync(FIXTURE, 'utf8'));

    await profile.finalize!(invoice);

    expect(find(invoice.toNode(), 'ds:SignatureValue')).toBeDefined();
    expect(find(invoice.toNode(), 'cbc:InvoiceTypeCode')?.attributes?.listVersionID).toBe('1.1');
  });
});
