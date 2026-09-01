import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtDate, UdtIdentifier } from '../datatypes/udt';
import { AdditionalItemProperty } from './ItemProperty';

/**
 * cac:LotIdentificationType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:LotIdentificationType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  lotNumberID: { order: 1, attributeName: 'cbc:LotNumberID', max: 1, classRef: UdtIdentifier },
  expiryDate: { order: 2, attributeName: 'cbc:ExpiryDate', max: 1, classRef: UdtDate },
  additionalItemProperties: {
    order: 3,
    attributeName: 'cac:AdditionalItemProperty',
    max: undefined,
    classRef: () => AdditionalItemProperty,
  },
};

type AllowedParams = {
  /** An identifier for the lot. */
  lotNumberID?: string | UdtIdentifier;
  /** The expiry date of the lot. */
  expiryDate?: string | UdtDate;
  /** An additional property of the lot. */
  additionalItemProperties?: AdditionalItemProperty[];
};

class LotIdentification extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:LotIdentification');
  }
}

export { LotIdentification, AllowedParams as LotIdentificationParams };
