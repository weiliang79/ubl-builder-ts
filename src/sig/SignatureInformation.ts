import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { RawContent } from '../core/rawContent';
import { UdtIdentifier } from '../datatypes/udt';

/**
 * sac:SignatureInformationType
 *
 * From UBL-SignatureAggregateComponents-2.1.xsd, which OASIS ships as part of
 * UBL 2.1 — signatures are not a country's addition to UBL, they are in the
 * standard. `test/sig/signatureComponents.spec.ts` holds this file to that
 * schema; the check:* gates are scoped to src/cac and do not reach here.
 *
 * ## ds:Signature is deliberately opaque
 *
 * The third child belongs to xmldsig-core, not to UBL, and its subtree is the
 * whole of XMLDSig and XAdES — SignedInfo, References, Transforms, KeyInfo,
 * QualifyingProperties. Modelling those as UBL components would put a W3C and
 * an ETSI schema inside a package whose contract is OASIS UBL 2.1, to describe
 * a tree nobody authors by hand: it falls out of computing the digests.
 *
 * So it is typed as {@link RawContent}, the same passthrough that already
 * carries a received `ext:ExtensionContent` unchanged. The signer builds the
 * node tree, this carries it, and byte-identity is preserved in both
 * directions.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  referencedSignatureID: { order: 2, attributeName: 'sbc:ReferencedSignatureID', max: 1, classRef: UdtIdentifier },
  signature: { order: 3, attributeName: 'ds:Signature', max: 1, classRef: RawContent },
};

type AllowedParams = {
  /** An identifier for this signature. MyInvois uses `urn:oasis:names:specification:ubl:signature:1`. */
  id?: string | UdtIdentifier;
  /** The `cbc:ID` of the `cac:Signature` in the document body that this signs. */
  referencedSignatureID?: string | UdtIdentifier;
  /** The `ds:Signature` element, built by the signer and carried unchanged. */
  signature?: RawContent;
};

class SignatureInformation extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'sac:SignatureInformation');
  }
}

export { SignatureInformation, AllowedParams as SignatureInformationParams };
