import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { OriginalItemLocationQuantity } from './ItemLocationQuantity';
import { Price } from './Price';

/**
 * cac:PricingReferenceType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:PricingReferenceType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  originalItemLocationQuantity: {
    order: 1,
    attributeName: 'cac:OriginalItemLocationQuantity',
    max: 1,
    classRef: () => OriginalItemLocationQuantity,
  },
  alternativeConditionPrices: {
    order: 2,
    attributeName: 'cac:AlternativeConditionPrice',
    max: undefined,
    classRef: () => Price,
  },
};

type AllowedParams = {
  /** An original set of location-specific properties (e.g., price and quantity) associated with this item. */
  originalItemLocationQuantity?: OriginalItemLocationQuantity;
  /** The price expressed in terms other than the actual price, e.g., the list price v. the contracted price, or the price in bags v. the price in kilos, or the list price in bags v. the contracted price in kilos. */
  alternativeConditionPrices?: Price[];
};

class PricingReference extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:PricingReference');
  }
}

export { PricingReference, AllowedParams as PricingReferenceParams };
