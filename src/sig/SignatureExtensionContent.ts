import { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import AnyExtensionContent from '../ext/AnyExtensionContent';
import { UBLDocumentSignatures } from './UBLDocumentSignatures';

/**
 * `ext:ExtensionContent` holding a `sig:UBLDocumentSignatures`.
 *
 * `ext:ExtensionContent` is `xsd:any`, so it has no params map of its own —
 * whoever constructs an {@link AnyExtensionContent} supplies one saying what
 * this particular extension carries. This is the one OASIS defines for
 * signatures, and the arrangement MyInvois uses:
 *
 *   ext:UBLExtensions / ext:UBLExtension / ext:ExtensionContent
 *     / sig:UBLDocumentSignatures / sac:SignatureInformation / ds:Signature
 *
 * The deleted `src/ext/SignatureExtensions.ts` was reaching for this and never
 * arrived — it named `cac:SignatureExtensions`, which is not an element in UBL
 * 2.1, and left its only classRef commented out.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  ublDocumentSignatures: {
    order: 1,
    attributeName: 'sig:UBLDocumentSignatures',
    max: 1,
    classRef: UBLDocumentSignatures,
  },
};

type AllowedParams = {
  /** An instance, not a params object — see {@link UBLDocumentSignatures}. */
  ublDocumentSignatures?: UBLDocumentSignatures;
};

class SignatureExtensionContent extends AnyExtensionContent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'ext:ExtensionContent');
  }
}

export { SignatureExtensionContent, AllowedParams as SignatureExtensionContentParams };
