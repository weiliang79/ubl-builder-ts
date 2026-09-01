import { ExchangeRate } from './ExchangeRate';
// 'use strict'

import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtText } from '../datatypes/udt';
import { UdtAmount } from '../datatypes/udt/UdtAmount';
import { UdtPercent } from '../datatypes/udt/UdtPercent';
import { EstimatedDeliveryPeriod, PeriodType } from './Period';

// const GenericAggregateComponent = require("./GenericAggregateComponent");;

// /* TODO GANERIC CLASSES */

// const { UdtCode, UdtIdentifier, UdtDate, UdtText, UdtTime, UdtName, UdtQuantity, UdtPercent, UdtAmount } = require("../types/UnqualifiedDataTypes");

// /* TODO GANERIC CLASSES */
// const { PeriodType } = require("./Period");

/*
    http://www.datypic.com/sc/ubl21/e-cac_PaymentTerms.html

  1  cbc:ID [0..1]    An identifier for this set of payment terms.
  2  cbc:PaymentMeansID [0..*]    An identifier for a means of payment associated with these payment terms.
  3  cbc:PrepaidPaymentReferenceID [0..1]    An identifier for a reference to a prepaid payment.
  4  cbc:Note [0..*]    Free-form text conveying information that is not contained explicitly in other structures.
  5  cbc:ReferenceEventCode [0..1]    A code signifying the event during which these terms are offered.
  6  cbc:SettlementDiscountPercent [0..1]    The percentage for the settlement discount that is offered for payment under these payment terms.
  7  cbc:PenaltySurchargePercent [0..1]    The penalty for payment after the settlement period, expressed as a percentage of the payment.
  8  cbc:PaymentPercent [0..1]    The part of a payment, expressed as a percent, relevant for these payment terms.
  9  cbc:Amount [0..1]    The monetary amount covered by these payment terms.
  10  cbc:SettlementDiscountAmount [0..1]    The amount of a settlement discount offered for payment under these payment terms.
  11  cbc:PenaltyAmount [0..1]    The monetary amount of the penalty for payment after the settlement period.
  12  cbc:PaymentTermsDetailsURI [0..1]    The Uniform Resource Identifier (URI) of a document providing additional details regarding these payment terms.
  13  cbc:PaymentDueDate [0..1]    The due date for these payment terms.
  14  cbc:InstallmentDueDate [0..1]    The due date for an installment payment for these payment terms.
  15  cbc:InvoicingPartyReference [0..1]    A reference to the payment terms used by the invoicing party. This may have been requested of the payer by the payee to accompany its remittance.
  16  cac:SettlementPeriod [0..1]    The period during which settlement may occur.
  17  cac:PenaltyPeriod [0..1]    The period during which penalties may apply.
  18  cac:ExchangeRate [0..1]    The currency exchange rate for purposes of these payment terms.
  19  cac:ValidityPeriod [0..1]    The period during which these payment terms are valid.
*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  paymentMeansIDs: { order: 2, attributeName: 'cbc:PaymentMeansID', max: undefined, classRef: UdtIdentifier },
  prepaidPaymentReferenceID: {
    order: 3,
    attributeName: 'cbc:PrepaidPaymentReferenceID',
    max: 1,
    classRef: UdtIdentifier,
  },
  notes: { order: 4, attributeName: 'cbc:Note', max: undefined, classRef: UdtText },
  referenceEventCode: { order: 5, attributeName: 'cbc:ReferenceEventCode', max: 1, classRef: UdtCode },
  settlementDiscountPercent: {
    order: 6,
    attributeName: 'cbc:SettlementDiscountPercent',
    max: 1,
    classRef: UdtPercent,
  },
  penaltySurchargePercent: {
    order: 7,
    attributeName: 'cbc:PenaltySurchargePercent',
    max: 1,
    classRef: UdtPercent,
  },
  paymentPercent: { order: 8, attributeName: 'cbc:PaymentPercent', max: 1, classRef: UdtPercent },
  amount: { order: 9, attributeName: 'cbc:Amount', max: 1, classRef: UdtAmount },
  settlementDiscountAmount: {
    order: 10,
    attributeName: 'cbc:SettlementDiscountAmount',
    max: 1,
    classRef: UdtAmount,
  },
  penaltyAmount: { order: 11, attributeName: 'cbc:PenaltyAmount', max: 1, classRef: UdtAmount },
  PaymentTermsDetailsURI: {
    order: 12,
    attributeName: 'cbc:PaymentTermsDetailsURI',
    max: 1,
    classRef: UdtIdentifier,
  },
  paymentDueDate: { order: 13, attributeName: 'cbc:PaymentDueDate', max: 1, classRef: UdtDate },
  installmentDueDate: { order: 14, attributeName: 'cbc:InstallmentDueDate', max: 1, classRef: UdtDate },
  invoicingPartyReference: {
    order: 15,
    attributeName: 'cbc:InvoicingPartyReference',
    max: 1,
    classRef: UdtText,
  },
  settlementPeriod: { order: 16, attributeName: 'cac:SettlementPeriod', max: 1, classRef: () => PeriodType },
  penaltyPeriod: { order: 17, attributeName: 'cac:PenaltyPeriod', max: 1, classRef: () => PeriodType },
  exchangeRate: { order: 18, attributeName: 'cac:ExchangeRate', max: 1, classRef: () => ExchangeRate },
  validityPeriod: {
    order: 19,
    attributeName: 'cac:ValidityPeriod',
    max: 1,
    classRef: () => EstimatedDeliveryPeriod,
  },
  // ##################################  TODO CAC MISSING ################################################
};

type AllowedParams = {
  /** The currency exchange rate for purposes of these payment terms. */
  exchangeRate?: ExchangeRate;
  /** The period during which these payment terms are valid. */
  validityPeriod?: EstimatedDeliveryPeriod;
  id?: string | UdtIdentifier;
  paymentMeansIDs?: string[] | UdtIdentifier[];
  prepaidPaymentReferenceID?: string | UdtIdentifier;
  notes?: (string | UdtText)[];
  referenceEventCode?: string | UdtCode;
  settlementDiscountPercent?: string | UdtPercent;
  penaltySurchargePercent?: string | UdtPercent;
  paymentPercent?: string | UdtPercent;
  amount?: string | UdtAmount;
  settlementDiscountAmount?: string | UdtAmount;
  penaltyAmount?: string | UdtAmount;
  PaymentTermsDetailsURI?: string | UdtIdentifier;
  paymentDueDate?: string | UdtDate;
  installmentDueDate?: string | UdtDate;
  // invoicingPartyReference: ,
  settlementPeriod?: string | PeriodType;
  penaltyPeriod?: string | PeriodType;

  invoicingPartyReference?: string | UdtText;
};

/**
 *
 */
class PaymentTermsType extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:PaymentTermsType');
  }
}

export { PaymentTermsType as PaymentTerms, AllowedParams as PaymentTermsTypeParams };
