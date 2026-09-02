import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtText } from '../datatypes/udt';
import { DocumentReference } from './DocumentReference';
import { IssuerParty } from './Party';
import { Signature } from './Signature';

/**
 * cac:CertificateType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:CertificateType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  certificateTypeCode: { order: 2, attributeName: 'cbc:CertificateTypeCode', max: 1, classRef: UdtCode },
  certificateType: { order: 3, attributeName: 'cbc:CertificateType', max: 1, classRef: UdtText },
  remarkses: { order: 4, attributeName: 'cbc:Remarks', max: undefined, classRef: UdtText },
  issuerParty: { order: 5, attributeName: 'cac:IssuerParty', max: 1, classRef: () => IssuerParty },
  documentReferences: {
    order: 6,
    attributeName: 'cac:DocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  signatures: { order: 7, attributeName: 'cac:Signature', max: undefined, classRef: () => Signature },
};

type AllowedParams = {
  /** An identifier for this certificate. */
  id: string | UdtIdentifier;
  /** The type of this certificate, expressed as a code. The type specifies what array it belongs to, e.g.. Environmental, security, health improvement etc. */
  certificateTypeCode: string | UdtCode;
  /** The type of this certificate, expressed as a code. The type specifies what array it belongs to, e.g.. Environmental, security, health improvement etc. */
  certificateType: string | UdtText;
  /** Remarks by the applicant for this certificate. */
  remarkses?: (string | UdtText)[];
  /** The authorized organization that issued this certificate, the provider of the certificate. */
  issuerParty: IssuerParty;
  /** A reference to a document relevant to this certificate or an application for this certificate. */
  documentReferences?: DocumentReference[];
  /** A signature applied to this certificate. */
  signatures?: Signature[];
};

class Certificate extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Certificate');
  }
}

export { Certificate, AllowedParams as CertificateParams };
