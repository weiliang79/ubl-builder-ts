import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtIndicator, UdtQuantity, UdtText } from '../datatypes/udt';
import { UdtAmount } from '../datatypes/udt/UdtAmount';
import { AllowanceCharge } from './AllowanceCharge';
import { BillingReference } from './BillingReference';
import { Delivery } from './Delivery';
import { DeliveryTerms } from './DeliveryTerms';
import { DocumentReference } from './DocumentReference';
import { Item } from './Item';
import { ItemPriceExtension } from './ItemPriceExtension';
import { DespatchLineReference, ReceiptLineReference } from './LineReference';
import { OrderLineReference } from './OrderLineReference';
import { Party } from './Party';
import { PaymentTerms } from './PaymentTerms';
import { PeriodType } from './Period';
import { Price } from './Price';
import { TaxTotal } from './TaxTotal';

/*
  1    cbc:ID [1..1]    An identifier for this credit note line.
  2    cbc:UUID [0..1]    A universally unique identifier for this credit note line.
  3    cbc:Note [0..*]    Free-form text conveying information that is not contained explicitly in other structures.
  4    cbc:CreditedQuantity [0..1]    The quantity of items credited in this credit note line.
  5    cbc:LineExtensionAmount [0..1]    The total amount for this credit note line, including allowance charges but exclusive of taxes.
  6    cbc:TaxPointDate [0..1]    The date of this credit note line, used to indicate the point at which tax becomes applicable.
  7    cbc:AccountingCostCode [0..1]    The buyer's accounting cost centre for this credit note line, expressed as a code.
  8    cbc:AccountingCost [0..1]    The buyer's accounting cost centre for this credit note line, expressed as text.
  9    cbc:PaymentPurposeCode [0..1]    A code signifying the business purpose for this payment.
  10   cbc:FreeOfChargeIndicator [0..1]    An indicator that this credit note line is free of charge (true) or not (false). The default is false.
  11   cac:InvoicePeriod [0..*]    An invoice period to which this credit note line applies.
  12   cac:OrderLineReference [0..*]    A reference to an order line associated with this credit note line.
  13   cac:DiscrepancyResponse [0..*]    A reason for the credit.
  14   cac:DespatchLineReference [0..*]    A reference to a despatch line associated with this credit note line.
  15   cac:ReceiptLineReference [0..*]    A reference to a receipt line associated with this credit note line.
  16   cac:BillingReference [0..*]    A reference to a billing document associated with this credit note line.
  17   cac:DocumentReference [0..*]    A reference to a document associated with this credit note line.
  18   cac:PricingReference [0..1]    A reference to pricing and item location information associated with this credit note line.
  19   cac:OriginatorParty [0..1]    The party who originated the Order to which the Credit Note is related.
  20   cac:Delivery [0..*]    A delivery associated with this credit note line.
  21   cac:PaymentTerms [0..*]    A specification of payment terms associated with this credit note line.
  22   cac:TaxTotal [0..*]    A total amount of taxes of a particular kind applicable to this credit note line.
  23   cac:AllowanceCharge [0..*]    An allowance or charge associated with this credit note.
  24   cac:Item [0..1]    The item associated with this credit note line.
  25   cac:Price [0..1]    The price of the item associated with this credit note line.
  26   cac:DeliveryTerms [0..*]    Terms and conditions of a delivery associated with this credit note line.
  27   cac:SubCreditNoteLine [0..*]    A class defining one or more Credit Note Lines detailing the credit note line.
  28   cac:ItemPriceExtension [0..1]    The price extension, calculated by multiplying the price per unit by the quantity of items on this credit note line.
*/

// ##################################  TODO CAC MISSING ################################################
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  allowanceCharges: { order: 23, attributeName: 'cac:AllowanceCharge', max: undefined, classRef: AllowanceCharge },
  subCreditNoteLines: {
    order: 27,
    attributeName: 'cac:SubCreditNoteLine',
    max: undefined,
    classRef: () => CreditNoteLineType,
  },
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  uuid: { order: 2, attributeName: 'cbc:UUID', max: 1, classRef: UdtIdentifier },
  notes: { order: 3, attributeName: 'cbc:Note', max: undefined, classRef: UdtText },
  creditedQuantity: { order: 4, attributeName: 'cbc:CreditedQuantity', max: 1, classRef: UdtQuantity },
  lineExtensionAmount: { order: 5, attributeName: 'cbc:LineExtensionAmount', max: 1, classRef: UdtAmount },
  taxPointDate: { order: 6, attributeName: 'cbc:TaxPointDate', max: 1, classRef: UdtDate },
  accountingCostCode: { order: 7, attributeName: 'cbc:AccountingCostCode', max: 1, classRef: UdtCode },
  accountingCost: { order: 8, attributeName: 'cbc:AccountingCost', max: 1, classRef: UdtText },
  paymentPurposeCode: { order: 9, attributeName: 'cbc:PaymentPurposeCode', max: 1, classRef: UdtCode },
  freeOfChargeIndicator: {
    order: 10,
    attributeName: 'cbc:FreeOfChargeIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  invoicePeriods: { order: 11, attributeName: 'cac:InvoicePeriod', max: undefined, classRef: () => PeriodType },
  orderLineReferences: {
    order: 12,
    attributeName: 'cac:OrderLineReference',
    max: undefined,
    classRef: () => OrderLineReference,
  },
  despatchLineReferences: {
    order: 14,
    attributeName: 'cac:DespatchLineReference',
    max: undefined,
    classRef: () => DespatchLineReference,
  },
  receiptLineReferences: {
    order: 15,
    attributeName: 'cac:ReceiptLineReference',
    max: undefined,
    classRef: () => ReceiptLineReference,
  },
  billingReferences: {
    order: 16,
    attributeName: 'cac:BillingReference',
    max: undefined,
    classRef: () => BillingReference,
  },
  documentReferences: {
    order: 17,
    attributeName: 'cac:DocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  originatorParty: { order: 19, attributeName: 'cac:OriginatorParty', max: 1, classRef: () => Party },
  deliveries: { order: 20, attributeName: 'cac:Delivery', max: undefined, classRef: () => Delivery },
  paymentTerms: { order: 21, attributeName: 'cac:PaymentTerms', max: undefined, classRef: () => PaymentTerms },
  taxTotals: { order: 22, attributeName: 'cac:TaxTotal', max: undefined, classRef: () => TaxTotal },
  item: { order: 24, attributeName: 'cac:Item', max: 1, classRef: () => Item },
  price: { order: 25, attributeName: 'cac:Price', max: 1, classRef: () => Price },
  deliveryTerms: {
    order: 26,
    attributeName: 'cac:DeliveryTerms',
    max: undefined,
    classRef: () => DeliveryTerms,
  },
  itemPriceExtension: {
    order: 28,
    attributeName: 'cac:ItemPriceExtension',
    max: 1,
    classRef: () => ItemPriceExtension,
  },
  // DiscrepancyResponses: { order: 13,  attributeName: 'cac:DiscrepancyResponse', max: undefined, classRef: null },
  // PricingReference: { order: 18,  attributeName: 'cac:PricingReference', max: 1, classRef: PricingReference },
};

type AllowedParams = {
  /** An allowance or charge associated with this credit note. */
  allowanceCharges?: AllowanceCharge[];
  /** A class defining one or more Credit Note Lines detailing the credit note line. */
  subCreditNoteLines?: CreditNoteLineType[];
  /** The price extension, calculated by multiplying the price per unit by the quantity of items on this credit note line. */
  itemPriceExtension?: ItemPriceExtension;
  id: string | UdtIdentifier;
  uuid?: string | UdtIdentifier;
  notes?: string[] | UdtText[];
  creditedQuantity?: string | UdtQuantity;
  lineExtensionAmount?: string | UdtAmount;
  taxPointDate?: string | UdtDate;
  accountingCostCode?: string | UdtCode;
  accountingCost?: string | UdtAmount;
  paymentPurposeCode?: string | UdtCode;
  freeOfChargeIndicator?: string | UdtIndicator;
  invoicePeriods?: PeriodType[];
  orderLineReferences?: OrderLineReference[];
  // DiscrepancyResponses: ,
  despatchLineReferences?: DespatchLineReference[];
  receiptLineReferences?: ReceiptLineReference[];
  billingReferences?: BillingReference[];
  documentReferences?: DocumentReference[];
  // PricingReference: '',
  originatorParty?: Party;
  deliveries?: Delivery[];
  paymentTerms?: PaymentTerms[];
  taxTotals?: TaxTotal[];
  item?: Item;
  price?: Price;
  deliveryTerms?: DeliveryTerms[];
};

/**
 *
 */
class CreditNoteLineType extends GenericAggregateComponent {
  /**     *
   * @param {AllowedParams} content
   * @param {string} name
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:CreditNoteLineType');
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

export {
  CreditNoteLineType as CreditNoteLine,
  AllowedParams as CreditNoteLineParams,
  CreditNoteLineType as SubCreditNoteLine,
};
