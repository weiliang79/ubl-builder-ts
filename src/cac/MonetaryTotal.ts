// 'use strict'

import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtAmount } from '../datatypes/udt/UdtAmount';

/*
  1  cbc:LineExtensionAmount [0..1]    The monetary amount of an extended transaction line, net of tax and settlement discounts, but inclusive of any applicable rounding amount.
  2  cbc:TaxExclusiveAmount [0..1]    The monetary amount of an extended transaction line, exclusive of taxes.
  3  cbc:TaxInclusiveAmount [0..1]    The monetary amount including taxes; the sum of payable amount and prepaid amount.
  4  cbc:AllowanceTotalAmount [0..1]    The total monetary amount of all allowances.
  5  cbc:ChargeTotalAmount [0..1]    The total monetary amount of all charges.
  6  cbc:PrepaidAmount [0..1]    The total prepaid monetary amount.
  7  cbc:PayableRoundingAmount [0..1]    The rounding amount (positive or negative) added to produce the line extension amount.
  8  cbc:PayableAmount [1..1]    The amount of the monetary total to be paid.
  9  cbc:PayableAlternativeAmount [0..1]    The amount of the monetary total to be paid, expressed in an alternative currency.
*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  lineExtensionAmount: { order: 1, attributeName: 'cbc:LineExtensionAmount', max: 1, classRef: UdtAmount },
  taxExclusiveAmount: { order: 2, attributeName: 'cbc:TaxExclusiveAmount', max: 1, classRef: UdtAmount },
  taxInclusiveAmount: { order: 3, attributeName: 'cbc:TaxInclusiveAmount', max: 1, classRef: UdtAmount },
  allowanceTotalAmount: { order: 4, attributeName: 'cbc:AllowanceTotalAmount', max: 1, classRef: UdtAmount },
  chargeTotalAmount: { order: 5, attributeName: 'cbc:ChargeTotalAmount', max: 1, classRef: UdtAmount },
  prepaidAmount: { order: 6, attributeName: 'cbc:PrepaidAmount', max: 1, classRef: UdtAmount },
  payableRoundingAmount: { order: 7, attributeName: 'cbc:PayableRoundingAmount', max: 1, classRef: UdtAmount },
  payableAmount: { order: 8, attributeName: 'cbc:PayableAmount', max: 1, classRef: UdtAmount },
  payableAlternativeAmount: {
    order: 9,
    attributeName: 'cbc:PayableAlternativeAmount',
    max: 1,
    classRef: UdtAmount,
  },
};

type AllowedParams = {
  taxExclusiveAmount?: string | UdtAmount;
  taxInclusiveAmount?: string | UdtAmount;
  payableAmount: string | UdtAmount;
  lineExtensionAmount?: string | UdtAmount;
  allowanceTotalAmount?: string | UdtAmount;
  chargeTotalAmount?: string | UdtAmount;
  prepaidAmount?: string | UdtAmount;
  payableRoundingAmount?: string | UdtAmount;
  payableAlternativeAmount?: string | UdtAmount;
};

/**
 *
 */
class MonetaryTotal extends GenericAggregateComponent {
  /**     *
   * @param {AllowedParams} content
   * @param {string} name
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:MonetaryTotal');
  }

  /**
   *
   * @param {boolean} raw Raw value
   */
  getLineExtensionAmount(raw = true) {
    return raw ? this.attributes.lineExtensionAmount.content : this.attributes.lineExtensionAmount;
  }

  /**
   *
   * @param {boolean} [raw=true] raw value
   */
  getPayableAmount(raw = true) {
    return raw ? this.attributes.payableAmount.content : this.attributes.payableAmount;
  }
}

export { MonetaryTotal as LegalMonetaryTotal, MonetaryTotal, AllowedParams as MonetaryTotalParams };
