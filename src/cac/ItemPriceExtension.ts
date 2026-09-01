import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtAmount } from '../datatypes/udt';
import { TaxTotal } from './TaxTotal';

/*
    cbc:Amount [1..1]  The amount of the item price.
*/
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  taxTotals: { order: 2, attributeName: 'cac:TaxTotal', max: undefined, classRef: () => TaxTotal },
  amount: { order: 1, attributeName: 'cbc:Amount', max: 1, classRef: UdtAmount },
};

interface AllowedParams {
  /** A total amount of taxes of a particular kind applicable to this price extension. */
  taxTotals?: TaxTotal[];
  amount: UdtAmount | string;
}

class ItemPriceExtension extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ItemPriceExtension');
  }
}

export { ItemPriceExtension, AllowedParams as ItemPriceExtensionParams };
