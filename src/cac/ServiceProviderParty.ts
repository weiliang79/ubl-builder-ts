import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtText } from '../datatypes/udt';
import { Contact } from './Contact';
import { Party } from './Party';

/**
 * cac:ServiceProviderPartyType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ServiceProviderPartyType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  serviceTypeCode: { order: 2, attributeName: 'cbc:ServiceTypeCode', max: 1, classRef: UdtCode },
  serviceTypes: { order: 3, attributeName: 'cbc:ServiceType', max: undefined, classRef: UdtText },
  party: { order: 4, attributeName: 'cac:Party', max: 1, classRef: () => Party },
  sellerContact: { order: 5, attributeName: 'cac:SellerContact', max: 1, classRef: () => Contact },
};

type AllowedParams = {
  /** An identifier for this service provider. */
  id?: string | UdtIdentifier;
  /** The type of service provided, expressed as a code. */
  serviceTypeCode?: string | UdtCode;
  /** The type of service provided, expressed as text. */
  serviceTypes?: (string | UdtText)[];
  /** The party providing the service. */
  party: Party;
  /** The contact for the service provider. */
  sellerContact?: Contact;
};

class ServiceProviderParty extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ServiceProviderParty');
  }
}

export { ServiceProviderParty, AllowedParams as ServiceProviderPartyParams };
