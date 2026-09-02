import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtText } from '../datatypes/udt';

/**
 * cac:TransportEquipmentSealType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TransportEquipmentSealType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  sealIssuerTypeCode: { order: 2, attributeName: 'cbc:SealIssuerTypeCode', max: 1, classRef: UdtCode },
  condition: { order: 3, attributeName: 'cbc:Condition', max: 1, classRef: UdtText },
  sealStatusCode: { order: 4, attributeName: 'cbc:SealStatusCode', max: 1, classRef: UdtCode },
  sealingPartyType: { order: 5, attributeName: 'cbc:SealingPartyType', max: 1, classRef: UdtText },
};

type AllowedParams = {
  /** An identifier for this transport equipment seal. */
  id: string | UdtIdentifier;
  /** A code signifying the type of party that issues and is responsible for this transport equipment seal. */
  sealIssuerTypeCode?: string | UdtCode;
  /** The condition of this transport equipment seal. */
  condition?: string | UdtText;
  /** A code signifying the condition of this transport equipment seal. */
  sealStatusCode?: string | UdtCode;
  /** The role of the sealing party. */
  sealingPartyType?: string | UdtText;
};

class TransportEquipmentSeal extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TransportEquipmentSeal');
  }
}

export { TransportEquipmentSeal, AllowedParams as TransportEquipmentSealParams };
