import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIndicator } from '../datatypes/udt';
import { UdtAmount } from '../datatypes/udt/UdtAmount';
import { TaxSubtotal } from './TaxSubtotal';

/*

  1  cbc:TaxAmount [1..1]    The total tax amount for a particular taxation scheme, e.g., VAT; the sum of the tax subtotals for each tax category within the taxation scheme.
  2  cbc:RoundingAmount [0..1]    The rounding amount (positive or negative) added to the calculated tax total to produce the rounded TaxAmount.
  3  cbc:TaxEvidenceIndicator [0..1]    An indicator that this total is recognized as legal evidence for taxation purposes (true) or not (false).
  4  cbc:TaxIncludedIndicator [0..1]    An indicator that tax is included in the calculation (true) or not (false).
  5  cac:TaxSubtotal [0..*]    One of the subtotals the sum of which equals the total tax amount for a particular taxation scheme.

*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  taxAmount: { order: 1, attributeName: 'cbc:TaxAmount', max: 1, classRef: UdtAmount },
  roundingAmount: { order: 2, attributeName: 'cbc:RoundingAmount', max: 1, classRef: UdtAmount },
  taxEvidenceIndicator: { order: 3, attributeName: 'cbc:TaxEvidenceIndicator', max: 1, classRef: UdtIndicator },
  taxIncludedIndicator: { order: 4, attributeName: 'cbc:TaxIncludedIndicator', max: 1, classRef: UdtIndicator },
  taxSubtotals: { order: 5, attributeName: 'cac:TaxSubtotal', max: undefined, classRef: () => TaxSubtotal },
};

type AllowedParams = {
  taxAmount: string | UdtAmount;
  roundingAmount?: string | UdtAmount;
  taxEvidenceIndicator?: string | UdtIndicator;
  taxSubtotals?: TaxSubtotal[];

  taxIncludedIndicator?: string | UdtIndicator;
};

/**
 *
 */
class TaxTotalType extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   * @param {string} name
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TaxTotalType');
  }

  /**
   *
   * @param { UdtAmount | string } value
   */
  setTaxAmount(value: string | UdtAmount) {
    this.attributes.taxAmount = value instanceof UdtAmount ? value : new UdtAmount(value);
  }

  /**
   *
   * @param {boolean} raw raw value
   */
  getTaxAmount(raw = true) {
    return raw ? this.attributes.taxAmount.content : this.attributes.taxAmount;
  }

  getTaxSubtotals(): TaxSubtotal[] {
    return this.attributes.taxSubtotals;
  }

  setTaxSubtotals(taxSubtotals: TaxSubtotal[]) {
    if (!Array.isArray(taxSubtotals)) throw new Error('taxSubtotals must to be an Array');
    taxSubtotals.forEach((value) => {
      if (!(value instanceof TaxSubtotal)) {
        throw new Error('Items of taxSubtotals must be instance of TaxSubtotal class');
      }
    });

    this.attributes.taxSubtotals = taxSubtotals;
  }

  /**
   * Sum of the tax amounts of this total's subtotals.
   *
   * getTaxAmount() yields the raw content, which is a string, so the previous
   * implementation concatenated instead of adding: ['10', '2.5'] produced
   * '0102.5' rather than 12.5.
   */
  calculateTotalTaxAmount(): number {
    return (this.attributes.taxSubtotals || []).reduce((acc: number, current: TaxSubtotal) => {
      return acc + Number(current.getTaxAmount());
    }, 0);
  }
}

export { TaxTotalType as TaxTotal, AllowedParams as TaxTotalTypeParams, TaxTotalType as WithholdingTaxTotal };
