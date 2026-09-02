import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtPercent } from '../datatypes/udt';
import { Address } from './Address';
import { DependentLineReference } from './LineReference';

/**
 * cac:DependentPriceReferenceType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:DependentPriceReferenceType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  percent: { order: 1, attributeName: 'cbc:Percent', max: 1, classRef: UdtPercent },
  locationAddress: { order: 2, attributeName: 'cac:LocationAddress', max: 1, classRef: () => Address },
  dependentLineReference: {
    order: 3,
    attributeName: 'cac:DependentLineReference',
    max: 1,
    classRef: () => DependentLineReference,
  },
};

type AllowedParams = {
  /** The percentage by which the price of the different item is multiplied to calculate the price of the item. */
  percent?: string | UdtPercent;
  /** The reference location for this dependent price reference. */
  locationAddress?: Address;
  /** A reference to a line that the price is depended of. */
  dependentLineReference?: DependentLineReference;
};

class DependentPriceReference extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:DependentPriceReference');
  }
}

export { DependentPriceReference, AllowedParams as DependentPriceReferenceParams };
