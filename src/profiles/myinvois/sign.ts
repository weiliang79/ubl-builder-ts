import { RawContent } from '../../core/rawContent';
import { toXmlString } from '../../core/serialize';
import { XmlNode } from '../../core/xmlNode';
import { Invoice } from '../../documents';
import { UBLExtension, UBLExtensions } from '../../ext';
import { SignatureExtensionContent, SignatureInformation, UBLDocumentSignatures } from '../../sig';
import { SHA256 } from '../../signing/digest';
import { signature as buildSignature, CertificateParams, qualifyingProperties } from '../../signing/xades';
import { DocumentVersion } from './codes';

/** `ext:ExtensionURI` and `cbc:SignatureMethod`: an enveloped XAdES signature. */
const ENVELOPED_XADES = 'urn:oasis:names:specification:ubl:dsig:enveloped:xades';
/** `sac:SignatureInformation/cbc:ID`, per LHDN's sample. */
const SIGNATURE_INFORMATION_ID = 'urn:oasis:names:specification:ubl:signature:1';
/** The `cac:Signature/cbc:ID` the signature information references. */
const DOCUMENT_SIGNATURE_ID = 'urn:oasis:names:specification:ubl:signature:Invoice';

/**
 * Namespaces a signed document declares on its root, beyond the three plain
 * MyInvois uses.
 *
 * Declared before the digest is taken, and that is the point. c14n11 is
 * non-exclusive, so these survive on the root even though removing
 * `ext:UBLExtensions` leaves nothing using them — LHDN canonicalizes the same
 * way, so signer and verifier agree only if they were present when the
 * document was hashed. klsheng's PHP SDK adds `ext` for exactly this reason,
 * with the comment "we need to add this before signature calculation".
 *
 * `ds` and `xades` are absent deliberately: they are declared on the signature
 * elements themselves, which live inside the subtree the transform removes, so
 * they never reach the digested document.
 */
const SIGNATURE_NAMESPACES: Record<string, string> = {
  'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
  'xmlns:sig': 'urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2',
  'xmlns:sac': 'urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2',
  'xmlns:sbc': 'urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2',
};

/**
 * MyInvois document signing — LHDN's procedure, in LHDN's order.
 *
 * https://sdk.myinvois.hasil.gov.my/signature-creation/
 *
 * ## This is not standard XMLDSig, and the differences are not cosmetic
 *
 * Two deviations, both confirmed against klsheng/myinvois-php-sdk (the mature
 * PHP implementation) and corroborated by @ibnumalik/myinvois for the JSON
 * variant of the same procedure:
 *
 *  1. **`ds:SignatureValue` signs the document, not `ds:SignedInfo`.** Standard
 *     XMLDSig signs the canonicalized SignedInfo element. LHDN signs the same
 *     bytes the DocDigest is taken over. A verifier built to the W3C spec would
 *     reject what this produces, and LHDN rejects what the W3C spec produces.
 *  2. **The properties digest covers `xades:QualifyingProperties`** — the
 *     element carrying `Target` — not the bare `xades:SignedProperties` the
 *     ETSI Reference `Type` points at, and it is digested with *no namespace
 *     declarations on it at all*.
 *
 * ## Order is the whole game
 *
 * The DocDigest is taken over the finished document. Anything that changes the
 * document afterwards — including the `listVersionID` bump from 1.0 to 1.1 —
 * gives LHDN a different digest when it recanonicalizes, and the submission is
 * rejected for a bad signature while validating perfectly against the schema.
 * So {@link signInvoice} bumps the version itself, first, rather than trusting
 * a caller to have done it.
 */

/** Signs bytes with the private key, returning the raw signature. */
export type Signer = (bytes: Uint8Array) => Uint8Array | Promise<Uint8Array>;

export interface SigningOptions {
  /**
   * Produces an RSA-SHA256 signature over the bytes it is given.
   *
   * A callback rather than a key: the private key never enters this library,
   * which is what lets the same code sign against a file, a smartcard, an HSM
   * or a cloud KMS. It is also why {@link signInvoice} is async.
   */
  sign: Signer;
  /** Identifies the signing certificate. See {@link CertificateParams}. */
  certificate: Omit<CertificateParams, 'digest'> & { digest?: string; der?: Uint8Array };
  /** Overrides `new Date()`, so a test can assert exact bytes. */
  signingTime?: Date;
}

const sha256 = new SHA256();

/** base64 of raw bytes, without going through a binary string first. */
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

/**
 * Remove `ext:UBLExtensions` and `cac:Signature` wherever they appear.
 *
 * This is the transform the first `ds:Reference` declares as two XPaths,
 * `not(//ancestor-or-self::ext:UBLExtensions)` and the same for
 * `cac:Signature`. `ancestor-or-self` excludes each element together with
 * everything under it, which is what dropping the subtree does.
 *
 * The root's namespace declarations are untouched, so `xmlns:ext` survives
 * with nothing left using it. That is correct and load-bearing: c14n11 is
 * non-exclusive and keeps it, and LHDN canonicalizes the same way.
 */
function withoutSignatureElements(node: XmlNode): XmlNode {
  const excluded = new Set(['ext:UBLExtensions', 'cac:Signature']);
  const prune = (current: XmlNode): XmlNode => ({
    ...current,
    children: (current.children ?? []).filter((child) => !excluded.has(child.name)).map(prune),
  });
  return prune(node);
}

/** Read `cbc:InvoiceTypeCode` back off the document so it can be re-set. */
function invoiceTypeCode(node: XmlNode): { value: string; attributes: Record<string, string> } | null {
  const found = (node.children ?? []).find((child) => child.name === 'cbc:InvoiceTypeCode');
  if (!found) return null;
  return {
    value: String(found.value ?? ''),
    attributes: Object.fromEntries(Object.entries(found.attributes ?? {}).map(([key, value]) => [key, String(value)])),
  };
}

/**
 * Sign an invoice in place, and return the canonical bytes that were signed.
 *
 * The document gains `ext:UBLExtensions` and `cac:Signature`; everything else
 * is left exactly as the caller built it. The returned string is what the
 * DocDigest was computed over — useful for a test, and for anyone reproducing
 * a rejection.
 */
export async function signInvoice(invoice: Invoice, options: SigningOptions): Promise<string> {
  // Step 0 — everything that changes the document, BEFORE anything is
  // digested. Done here rather than left to the caller: a bump afterwards
  // gives LHDN a different digest, and the only symptom is a rejected
  // signature on a document that validates perfectly.
  const current = invoiceTypeCode(invoice.toNode());
  if (!current) {
    throw new Error('cbc:InvoiceTypeCode must be set before signing: MyInvois carries the document version there');
  }
  invoice.setInvoiceTypeCode(current.value, { ...current.attributes, listVersionID: DocumentVersion.Signed });
  Object.entries(SIGNATURE_NAMESPACES).forEach(([key, value]) => invoice.addProperty(key, value));

  // Steps 1-2 — transform, canonicalize, digest.
  const signed = toXmlString(withoutSignatureElements(invoice.toNode()), { canonical: true });
  const documentDigest = await sha256.getHash(signed, 'utf8', 'base64');

  // Step 4 — sign the document bytes themselves, not ds:SignedInfo.
  const signatureValue = toBase64(await options.sign(new TextEncoder().encode(signed)));

  // Steps 5-6 — the certificate's own digest, then the properties that carry it.
  const { der, digest, ...certificate } = options.certificate;
  if (!digest && !der) {
    throw new Error('certificate needs either `digest` (base64 SHA-256 of the DER bytes) or `der` to compute it from');
  }
  const certificateParams: CertificateParams = {
    ...certificate,
    digest: digest ?? (await sha256.getHash(toBase64(der as Uint8Array), 'base64', 'base64')),
  };

  const properties = qualifyingProperties(certificateParams, (options.signingTime ?? new Date()).toISOString());
  const propertiesDigest = await sha256.getHash(
    toXmlString({ ...properties, name: properties.name }, { canonical: true }),
    'utf8',
    'base64',
  );

  // Step 7 — assemble, and attach to the document.
  const signature = buildSignature({
    documentDigest,
    propertiesDigest,
    signatureValue,
    certificate: certificateParams,
    qualifyingProperties: properties,
  });

  const extensions = new UBLExtensions();
  extensions.addUBLExtension(
    new UBLExtension({
      extensionURI: ENVELOPED_XADES,
      extensionContent: new SignatureExtensionContent({
        ublDocumentSignatures: new UBLDocumentSignatures({
          signatureInformations: [
            new SignatureInformation({
              id: SIGNATURE_INFORMATION_ID,
              referencedSignatureID: DOCUMENT_SIGNATURE_ID,
              signature: new RawContent(signature),
            }),
          ],
        }),
      }),
    }),
  );
  invoice.setUBLExtensions(extensions);

  // `name` is this component's key for cbc:ID — a quirk of cac:Signature, not
  // a typo. It is what the first ds:Reference points back at.
  invoice.addSignature({ name: DOCUMENT_SIGNATURE_ID, signatureMethod: ENVELOPED_XADES });

  return signed;
}
