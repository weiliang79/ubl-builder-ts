import { ParsedElement } from '../core/parse';

/**
 * The XAdES-BES element tree, as bytes-in bytes-out structure.
 *
 * Nothing here computes a digest or reaches a key. It takes values already
 * computed and arranges them into the `ds:Signature` element UBL carries in
 * `sac:SignatureInformation` — which keeps the part that must be exactly right
 * (the order of operations, and what is hashed) in one readable procedure
 * elsewhere, rather than scattered through a tree builder.
 *
 * Trees are {@link ParsedElement} because that is what {@link RawContent}
 * carries, and RawContent is how a `ds:Signature` reaches a UBL document
 * without xmldsig-core being modelled as UBL components.
 */

/** `http://www.w3.org/2000/09/xmldsig#` */
export const DS_NAMESPACE = 'http://www.w3.org/2000/09/xmldsig#';
/** `http://uri.etsi.org/01903/v1.3.2#` */
export const XADES_NAMESPACE = 'http://uri.etsi.org/01903/v1.3.2#';

/** SHA-256 digest algorithm, as `ds:DigestMethod/@Algorithm` names it. */
export const SHA256_URI = 'http://www.w3.org/2001/04/xmlenc#sha256';
/** RSA with SHA-256, as `ds:SignatureMethod/@Algorithm` names it. */
export const RSA_SHA256_URI = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
/** Canonical XML 1.1 — the algorithm `core/canonical.ts` implements. */
export const C14N11_URI = 'http://www.w3.org/2006/12/xml-c14n11';
/** ETSI's type marker on the Reference that covers the signed properties. */
export const SIGNED_PROPERTIES_TYPE = 'http://uri.etsi.org/01903/v1.3.2#SignedProperties';

/** `ds:Signature/@Id`, and the `Target` the qualifying properties point at. */
export const SIGNATURE_ID = 'signature';
/** `xades:SignedProperties/@Id`, referenced by the second `ds:Reference`. */
export const SIGNED_PROPERTIES_ID = 'id-xades-signed-props';
/** `ds:Reference/@Id` on the reference covering the document. */
export const DOCUMENT_REFERENCE_ID = 'id-doc-signed-data';

/** Build an element. Both maps are always present, as ParsedElement requires. */
export function element(
  name: string,
  options: { value?: string; attributes?: Record<string, string>; children?: ParsedElement[] } = {},
): ParsedElement {
  return {
    name,
    ...(options.value !== undefined ? { value: options.value } : {}),
    attributes: options.attributes ?? {},
    children: options.children ?? [],
  };
}

/** What identifies the signing certificate inside the signature. */
export interface CertificateParams {
  /**
   * The certificate as base64 DER — the body of the PEM, newlines removed.
   * This is what `ds:X509Certificate` carries verbatim.
   */
  base64: string;
  /** base64(SHA-256(DER bytes)), for `xades:CertDigest`. */
  digest: string;
  /**
   * The issuer distinguished name.
   *
   * Supplied by the caller rather than parsed, because the *order* of the
   * relative names is not canonical and differs between CAs — klsheng's PHP
   * SDK had to make it configurable, defaulting to `CN, E, OU, O, C`. Reading
   * it out of the certificate would also mean an X.509 parser, and Web Crypto
   * has none, which would make this package Node-only.
   */
  issuerName: string;
  /** The certificate serial number in decimal, for `xades:IssuerSerial`. */
  serialNumber: string;
}

/**
 * `xades:QualifyingProperties` — the signed properties, and what covers them.
 *
 * Deliberately carries no namespace declarations. This element is digested as
 * well as embedded, and MyInvois digests it bare: klsheng's implementation
 * canonicalizes it under a synthetic root that holds the `ds` and `xades`
 * declarations, then removes that root textually, leaving a fragment with none
 * of its own. Declaring them here would change the digest and the signature
 * would be rejected. See `profiles/myinvois/sign.ts` for the procedure.
 */
export function qualifyingProperties(certificate: CertificateParams, signingTime: string): ParsedElement {
  return element('xades:QualifyingProperties', {
    // `signature`, not `#signature`. XAdES defines Target as a URI reference
    // and every other implementation would write the fragment form, but LHDN
    // wants it bare — klsheng ships `'Target' => 'signature'`. This attribute
    // is inside the digested properties, so the wrong form changes PropsDigest
    // and the signature is rejected.
    attributes: { Target: SIGNATURE_ID },
    children: [
      element('xades:SignedProperties', {
        attributes: { Id: SIGNED_PROPERTIES_ID },
        children: [
          element('xades:SignedSignatureProperties', {
            children: [
              element('xades:SigningTime', { value: signingTime }),
              element('xades:SigningCertificate', {
                children: [
                  element('xades:Cert', {
                    children: [
                      element('xades:CertDigest', {
                        children: [
                          element('ds:DigestMethod', { attributes: { Algorithm: SHA256_URI } }),
                          element('ds:DigestValue', { value: certificate.digest }),
                        ],
                      }),
                      element('xades:IssuerSerial', {
                        children: [
                          element('ds:X509IssuerName', { value: certificate.issuerName }),
                          element('ds:X509SerialNumber', { value: certificate.serialNumber }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** The values a finished `ds:Signature` is assembled from. */
export interface SignatureParams {
  /** base64(SHA-256(canonicalized document, transforms applied)). */
  documentDigest: string;
  /** base64(SHA-256(canonicalized qualifying properties)). */
  propertiesDigest: string;
  /** base64 of the raw RSA signature bytes. */
  signatureValue: string;
  certificate: CertificateParams;
  /** The same tree whose digest is `propertiesDigest`, embedded unchanged. */
  qualifyingProperties: ParsedElement;
}

/**
 * `ds:SignedInfo` — the two references LHDN expects.
 *
 * The first covers the document, and carries the exclusion as two XPath
 * transforms followed by the canonicalization algorithm. The XPaths are what
 * a verifier reads to know *which* elements were left out; the digest itself
 * is computed by building the document without them, which is simpler and
 * gives the same bytes.
 *
 * The second covers the qualifying properties by URI.
 */
function signedInfo({ documentDigest, propertiesDigest }: SignatureParams): ParsedElement {
  return element('ds:SignedInfo', {
    children: [
      element('ds:CanonicalizationMethod', { attributes: { Algorithm: C14N11_URI } }),
      element('ds:SignatureMethod', { attributes: { Algorithm: RSA_SHA256_URI } }),
      element('ds:Reference', {
        attributes: { Id: DOCUMENT_REFERENCE_ID, URI: '' },
        children: [
          element('ds:Transforms', {
            children: [
              element('ds:Transform', {
                attributes: { Algorithm: 'http://www.w3.org/TR/1999/REC-xpath-19991116' },
                children: [element('ds:XPath', { value: 'not(//ancestor-or-self::ext:UBLExtensions)' })],
              }),
              element('ds:Transform', {
                attributes: { Algorithm: 'http://www.w3.org/TR/1999/REC-xpath-19991116' },
                children: [element('ds:XPath', { value: 'not(//ancestor-or-self::cac:Signature)' })],
              }),
              element('ds:Transform', { attributes: { Algorithm: C14N11_URI } }),
            ],
          }),
          element('ds:DigestMethod', { attributes: { Algorithm: SHA256_URI } }),
          element('ds:DigestValue', { value: documentDigest }),
        ],
      }),
      element('ds:Reference', {
        attributes: { Type: SIGNED_PROPERTIES_TYPE, URI: `#${SIGNED_PROPERTIES_ID}` },
        children: [
          element('ds:DigestMethod', { attributes: { Algorithm: SHA256_URI } }),
          element('ds:DigestValue', { value: propertiesDigest }),
        ],
      }),
    ],
  });
}

/**
 * Assemble the complete `ds:Signature`.
 *
 * The `ds` and `xades` namespaces are declared here, on the signature itself,
 * so the element is self-describing wherever a document chooses to put it —
 * and so a document that carries no signature declares neither.
 */
export function signature(params: SignatureParams): ParsedElement {
  return element('ds:Signature', {
    attributes: { Id: SIGNATURE_ID, 'xmlns:ds': DS_NAMESPACE },
    children: [
      signedInfo(params),
      element('ds:SignatureValue', { value: params.signatureValue }),
      element('ds:KeyInfo', {
        children: [
          element('ds:X509Data', {
            children: [
              element('ds:X509Certificate', { value: params.certificate.base64 }),
              element('ds:X509IssuerSerial', {
                children: [
                  element('ds:X509IssuerName', { value: params.certificate.issuerName }),
                  element('ds:X509SerialNumber', { value: params.certificate.serialNumber }),
                ],
              }),
            ],
          }),
        ],
      }),
      element('ds:Object', {
        attributes: { 'xmlns:xades': XADES_NAMESPACE },
        children: [params.qualifyingProperties],
      }),
    ],
  });
}
