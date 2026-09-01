// 'use strict'

import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier } from '../datatypes/udt';
import { UdtRate } from '../datatypes/udt/UdtRate';
import { ForeignExchangeContract } from './Contract';

// const GenericAggregateComponent = require("./GenericAggregateComponent");

// /* TODO GANERIC CLASSES */

// const { UdtCode, UdtIdentifier, UdtDate, UdtText, UdtTime, UdtName, UdtQuantity, UdtRate } = require("../types/UnqualifiedDataTypes");

/* TODO GANERIC CLASSES */

/*

  1  cbc:SourceCurrencyCode [1..1]    The reference currency for this exchange rate; the currency from which the exchange is being made.
  2  cbc:SourceCurrencyBaseRate [0..1]    In the case of a source currency with denominations of small value, the unit base.
  3  cbc:TargetCurrencyCode [1..1]    The target currency for this exchange rate; the currency to which the exchange is being made.
  4  cbc:TargetCurrencyBaseRate [0..1]    In the case of a target currency with denominations of small value, the unit base.
  5  cbc:ExchangeMarketID [0..1]    An identifier for the currency exchange market used as the source of this exchange rate.
  6  cbc:CalculationRate [0..1]    The factor applied to the source currency to calculate the target currency.
  7  cbc:MathematicOperatorCode [0..1]    A code signifying whether the calculation rate is a multiplier or a divisor.
  8  cbc:Date [0..1]    The date on which the exchange rate was established.
  9  cac:ForeignExchangeContract [0..1]    A contract for foreign exchange.

*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  foreignExchangeContract: {
    order: 9,
    attributeName: 'cac:ForeignExchangeContract',
    max: 1,
    classRef: () => ForeignExchangeContract,
  },
  sourceCurrencyCode: { order: 1, attributeName: 'cbc:SourceCurrencyCode', max: 1, classRef: UdtCode },
  sourceCurrencyBaseRate: { order: 2, attributeName: 'cbc:SourceCurrencyBaseRate', max: 1, classRef: UdtRate },
  targetCurrencyCode: { order: 3, attributeName: 'cbc:TargetCurrencyCode', max: 1, classRef: UdtCode },
  targetCurrencyBaseRate: { order: 4, attributeName: 'cbc:TargetCurrencyBaseRate', max: 1, classRef: UdtRate },
  exchangeMarketID: { order: 5, attributeName: 'cbc:ExchangeMarketID', max: 1, classRef: UdtIdentifier },
  calculationRate: { order: 6, attributeName: 'cbc:CalculationRate', max: 1, classRef: UdtRate },
  mathematicOperatorCode: { order: 7, attributeName: 'cbc:MathematicOperatorCode', max: 1, classRef: UdtCode },
  date: { order: 8, attributeName: 'cbc:Date', max: 1, classRef: UdtDate },
  // ForeignExchangeContract: { order: 9,  attributeName: 'cac:ForeignExchangeContract', max: 1, classRef: ForeignExchangeContract },

  // ##################################  TODO CAC MISSING ################################################

  // postalAddress: { order: 10,  attributeName: 'cac:PostalAddress', max: 1, classRef: PostalAddress }, //

  // ##################################  TODO CAC MISSING ################################################
};

type AllowedParams = {
  /** A contract for foreign exchange. */
  foreignExchangeContract?: ForeignExchangeContract;
  sourceCurrencyCode: string | UdtCode;
  sourceCurrencyBaseRate?: string | UdtRate;
  targetCurrencyCode: string | UdtCode;
  targetCurrencyBaseRate?: string | UdtRate;
  exchangeMarketID?: string | UdtIdentifier;
  calculationRate?: string | UdtRate;
  mathematicOperatorCode?: string | UdtCode;
  date?: string | UdtDate;
};

/**
 *
 */
class ExchangeRate extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ExchangeRate');
  }
}

export {
  ExchangeRate,
  AllowedParams as ExchangeRateParams,
  ExchangeRate as PaymentAlternativeExchangeRate,
  ExchangeRate as PaymentExchangeRate,
  ExchangeRate as PricingExchangeRate,
  ExchangeRate as TaxExchangeRate,
};
