import { AllowanceCharge } from './AllowanceCharge';
// 'use strict'

import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtQuantity, UdtText } from '../datatypes/udt';
import { UdtAmount } from '../datatypes/udt/UdtAmount';
import { BillingReference } from './BillingReference';
import { Delivery } from './Delivery';
import { DocumentReference } from './DocumentReference';
import { Item } from './Item';
import { DespatchLineReference, ReceiptLineReference } from './LineReference';
import { Price } from './Price';
import { TaxTotal } from './TaxTotal';

/*
  01 cbc:ID [1..1]    An identifier for this debit note line.
  02 cbc:UUID [0..1]    A universally unique identifier for this debit note line.
  03 cbc:Note [0..*]    Free-form text conveying information that is not contained explicitly in other structures.
  04 cbc:DebitedQuantity [0..1]    The quantity of Items debited in this debit note line.
  05 cbc:LineExtensionAmount [1..1]    The total amount for this debit note line, including allowance charges but net of taxes.
  06 cbc:TaxPointDate [0..1]    The date of this debit note line, used to indicate the point at which tax becomes applicable.
  07 cbc:AccountingCostCode [0..1]    The buyer's accounting cost centre for this debit note line, expressed as a code.
  08 cbc:AccountingCost [0..1]    The buyer's accounting cost centre for this debit note line, expressed as text.
  09 cbc:PaymentPurposeCode [0..1]    A code signifying the business purpose for this payment.
  10 cac:DiscrepancyResponse [0..*]    A reason for the debit.
  11 cac:DespatchLineReference [0..*]    A reference to a despatch line associated with this debit note line.
  12 cac:ReceiptLineReference [0..*]    A reference to a receipt line associated with this debit note line.
  13 cac:BillingReference [0..*]    A reference to a billing document associated with this debit note line.
  14 cac:DocumentReference [0..*]    A reference to a document associated with this debit note line.
  15 cac:PricingReference [0..1]    A reference to pricing and item location information associated with this debit note line.
  16 cac:Delivery [0..*]    A delivery associated with this debit note line.
  17 cac:TaxTotal [0..*]    A total amount of taxes of a particular kind applicable to this debit note line.
  18 cac:AllowanceCharge [0..*]    An allowance or charge associated with this debit note.
  19 cac:Item [0..1]    The item associated with this debit note line.
  20 cac:Price [0..1]    The price of the item associated with this debit note line.
  21 cac:SubDebitNoteLine [0..*]    A recursive description of a debit note line subsidiary to this debit note line.
*/

// ##################################  TODO CAC MISSING ################################################
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  uuid: { order: 2, attributeName: 'cbc:UUID', max: 1, classRef: UdtIdentifier },
  notes: { order: 3, attributeName: 'cbc:Note', max: undefined, classRef: UdtText },
  debitedQuantity: { order: 4, attributeName: 'cbc:DebitedQuantity', max: 1, classRef: UdtQuantity },
  lineExtensionAmount: { order: 5, attributeName: 'cbc:LineExtensionAmount', max: 1, classRef: UdtAmount },
  taxPointDate: { order: 6, attributeName: 'cbc:TaxPointDate', max: 1, classRef: UdtDate },
  accountingCostCode: { order: 7, attributeName: 'cbc:AccountingCostCode', max: 1, classRef: UdtCode },
  accountingCost: { order: 8, attributeName: 'cbc:AccountingCost', max: 1, classRef: UdtText },
  paymentPurposeCode: { order: 9, attributeName: 'cbc:PaymentPurposeCode', max: 1, classRef: UdtCode },
  despatchLineReferences: {
    order: 11,
    attributeName: 'cac:DespatchLineReference',
    max: undefined,
    classRef: () => DespatchLineReference,
  },
  receiptLineReferences: {
    order: 12,
    attributeName: 'cac:ReceiptLineReference',
    max: undefined,
    classRef: () => ReceiptLineReference,
  },
  billingReferences: {
    order: 13,
    attributeName: 'cac:BillingReference',
    max: undefined,
    classRef: () => BillingReference,
  },
  documentReferences: {
    order: 14,
    attributeName: 'cac:DocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  deliveries: { order: 16, attributeName: 'cac:Delivery', max: undefined, classRef: () => Delivery },
  taxTotals: { order: 17, attributeName: 'cac:TaxTotal', max: undefined, classRef: () => TaxTotal },
  allowanceCharges: {
    order: 18,
    attributeName: 'cac:AllowanceCharge',
    max: undefined,
    classRef: () => AllowanceCharge,
  },
  item: { order: 19, attributeName: 'cac:Item', max: 1, classRef: () => Item },
  price: { order: 20, attributeName: 'cac:Price', max: 1, classRef: () => Price },
  // discrepancyResponses: { order: 10,  attributeName: 'cac:DiscrepancyResponse', max: undefined, classRef: undefined },
  // pricingReference: { order: 15,  attributeName: 'cac:PricingReference', max: 1, classRef: undefined },
  // allowanceCharges: { order: 18,  attributeName: 'cac:TaxTotal', max: undefined, classRef: () => AllowanceCharge },
  // subDebitNoteLine: { order: 21,  attributeName: 'cac:SubDebitNoteLine', max: undefined, classRef: undefined },
};

type AllowedParams = {
  /** An allowance or charge associated with this debit note. */
  allowanceCharges?: AllowanceCharge[];
  id: string | UdtIdentifier;
  uuid?: string | UdtIdentifier;
  notes?: string | UdtText;
  debitedQuantity?: string | UdtQuantity;
  lineExtensionAmount: string | UdtAmount;
  taxPointDate?: string | UdtDate;
  accountingCostCode?: string | UdtCode;
  accountingCost?: string | UdtText;
  paymentPurposeCode?: string | UdtCode;
  despatchLineReferences?: DespatchLineReference[];
  receiptLineReferences?: ReceiptLineReference[];
  billingReferences?: BillingReference[];
  documentReferences?: DocumentReference[];
  deliveries?: Delivery[];
  taxTotals?: TaxTotal[];
  item?: Item;
  price?: Price;
};

/**
 *
 */
class DebitNoteLineType extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:DebitNoteLineType');
  }

  /**
   * @returns {TaxTotal}
   */
  getTaxTotals() {
    return this.attributes.taxTotals;
  }

  setId(value: string | UdtIdentifier) {
    this.attributes.id = value instanceof UdtIdentifier ? value : new UdtIdentifier(value);
  }
}

export { DebitNoteLineType as DebitNoteLine, AllowedParams as DebitNoteLineParams };
