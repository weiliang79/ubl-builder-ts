import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIndicator, UdtMeasure, UdtQuantity, UdtText } from '../datatypes/udt';
import { Address } from './Address';
import { AllowanceCharge } from './AllowanceCharge';
import { DeliveryUnit } from './DeliveryUnit';
import { DependentPriceReference } from './DependentPriceReference';
import { Package } from './Package';
import { Price } from './Price';
import { TaxCategory } from './TaxCategory';

/**
 * cac:ItemLocationQuantityType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ItemLocationQuantityType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  leadTimeMeasure: { order: 1, attributeName: 'cbc:LeadTimeMeasure', max: 1, classRef: UdtMeasure },
  minimumQuantity: { order: 2, attributeName: 'cbc:MinimumQuantity', max: 1, classRef: UdtQuantity },
  maximumQuantity: { order: 3, attributeName: 'cbc:MaximumQuantity', max: 1, classRef: UdtQuantity },
  hazardousRiskIndicator: { order: 4, attributeName: 'cbc:HazardousRiskIndicator', max: 1, classRef: UdtIndicator },
  tradingRestrictionses: { order: 5, attributeName: 'cbc:TradingRestrictions', max: undefined, classRef: UdtText },
  applicableTerritoryAddresses: {
    order: 6,
    attributeName: 'cac:ApplicableTerritoryAddress',
    max: undefined,
    classRef: () => Address,
  },
  price: { order: 7, attributeName: 'cac:Price', max: 1, classRef: () => Price },
  deliveryUnits: { order: 8, attributeName: 'cac:DeliveryUnit', max: undefined, classRef: () => DeliveryUnit },
  applicableTaxCategories: {
    order: 9,
    attributeName: 'cac:ApplicableTaxCategory',
    max: undefined,
    classRef: () => TaxCategory,
  },
  package: { order: 10, attributeName: 'cac:Package', max: 1, classRef: () => Package },
  allowanceCharges: {
    order: 11,
    attributeName: 'cac:AllowanceCharge',
    max: undefined,
    classRef: () => AllowanceCharge,
  },
  dependentPriceReference: {
    order: 12,
    attributeName: 'cac:DependentPriceReference',
    max: 1,
    classRef: () => DependentPriceReference,
  },
};

type AllowedParams = {
  /** The lead time, i.e., the time taken from the time at which an item is ordered to the time of its delivery. */
  leadTimeMeasure?: string | UdtMeasure;
  /** The minimum quantity that can be ordered to qualify for a specific price. */
  minimumQuantity?: string | UdtQuantity;
  /** The maximum quantity that can be ordered to qualify for a specific price. */
  maximumQuantity?: string | UdtQuantity;
  /** An indication that the transported item, as delivered, in the stated quantity to the stated location, is subject to an international regulation concerning the carriage of dangerous goods (true) or not (false). */
  hazardousRiskIndicator?: string | UdtIndicator;
  /** Text describing trade restrictions on the quantity of this item or on the item itself. */
  tradingRestrictionses?: (string | UdtText)[];
  /** The applicable sales territory. */
  applicableTerritoryAddresses?: Address[];
  /** The price associated with the given location. */
  price?: Price;
  /** A delivery unit in which the item is located. */
  deliveryUnits?: DeliveryUnit[];
  /** A tax category applicable to this item location quantity. */
  applicableTaxCategories?: TaxCategory[];
  /** The package to which this price applies. */
  package?: Package;
  /** An allowance or charge associated with this item location quantity. */
  allowanceCharges?: AllowanceCharge[];
  /** The price of the item as a percentage of the price of some other item. */
  dependentPriceReference?: DependentPriceReference;
};

class ItemLocationQuantity extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ItemLocationQuantity');
  }
}

export {
  ItemLocationQuantity,
  AllowedParams as ItemLocationQuantityParams,
  ItemLocationQuantity as OfferedItemLocationQuantity,
  ItemLocationQuantity as OriginalItemLocationQuantity,
  ItemLocationQuantity as RequiredItemLocationQuantity,
};
