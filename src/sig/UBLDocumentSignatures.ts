import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { SignatureInformation } from './SignatureInformation';

/**
 * sig:UBLDocumentSignaturesType
 *
 * From UBL-CommonSignatureComponents-2.1.xsd. This is what goes inside
 * `ext:ExtensionContent` when a UBL document carries a signature — the
 * arrangement MyInvois uses, and the one OASIS defines for every UBL document.
 *
 * `sac:SignatureInformation` is [1..*], so the params key is plural and takes
 * an array; a document with one signature still passes a one-element list.
 * `max` is deliberately absent, which is how this model spells unbounded.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  signatureInformations: { order: 1, attributeName: 'sac:SignatureInformation', classRef: SignatureInformation },
};

type AllowedParams = {
  /**
   * One entry per signature on the document; UBL allows several, MyInvois
   * uses one.
   *
   * Instances, not plain params objects — the convention every aggregate
   * child in this library follows, and not a stylistic one:
   * `buildClassInstance` reads any object as `{ content, attributes }`, so a
   * bare `{ id: '…' }` here would serialise as an empty
   * `<sac:SignatureInformation/>` rather than raising.
   */
  signatureInformations?: SignatureInformation[];
};

class UBLDocumentSignatures extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'sig:UBLDocumentSignatures');
  }
}

export { UBLDocumentSignatures, AllowedParams as UBLDocumentSignaturesParams };
