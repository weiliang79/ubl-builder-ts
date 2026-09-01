import {
  AccountingCustomerParty,
  AccountingSupplierParty,
  AdditionalDocumentReference,
  AllowanceCharge,
  BillingReference,
  BuyerCustomerParty,
  ContractDocumentReference,
  Delivery,
  DeliveryTerms,
  DespatchDocumentReference,
  InvoiceLine,
  LegalMonetaryTotal,
  OrderReference,
  OriginatorDocumentReference,
  PayeeParty,
  PaymentAlternativeExchangeRate,
  PaymentExchangeRate,
  PaymentMeans,
  PaymentTerms,
  PeriodType,
  PrepaidPayment,
  PricingExchangeRate,
  ProjectReference,
  ReceiptDocumentReference,
  SellerSupplierParty,
  Signature,
  StatementDocumentReference,
  TaxExchangeRate,
  TaxRepresentativeParty,
  TaxTotal,
  WithholdingTaxTotal,
} from '../cac';
import { UBLVersionID } from '../datatypes/cbc';
import { UdtCode, UdtDate, UdtIdentifier, UdtIndicator, UdtNumeric, UdtText, UdtTime } from '../datatypes/udt';
import { UBLExtensions } from '../ext';

interface IGenericKeyValue<T> {
  [id: string]: T;
}

type SchemaDocumentChild = {
  order: number;
  childName: string;
  max?: number;
  /**
   * The class a raw value is built into.
   *
   * The component params maps have carried this since the fork; the document
   * map did not, so what an Invoice child becomes lived only inside sixty
   * hand-written setters. Nothing could read the mapping back — which is what a
   * parser needs, and why eight children could be declared here with no setter
   * at all and nobody noticed.
   */
  classRef: unknown;
};

export const INVOICE_CHILDREN_MAP: IGenericKeyValue<SchemaDocumentChild> = {
  UBLExtensions: { order: 1, childName: 'ext:UBLExtensions', max: 1, classRef: UBLExtensions },
  UBLVersionID: { order: 2, childName: 'cbc:UBLVersionID', max: 1, classRef: UBLVersionID },
  customizationID: { order: 3, childName: 'cbc:CustomizationID', max: 1, classRef: UdtIdentifier },
  profileID: { order: 4, childName: 'cbc:ProfileID', max: 1, classRef: UdtIdentifier },
  profileExecutionID: { order: 5, childName: 'cbc:ProfileExecutionID', max: 1, classRef: UdtIdentifier },
  id: { order: 6, childName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  copyIndicator: { order: 7, childName: 'cbc:CopyIndicator', max: 1, classRef: UdtIndicator },
  uuid: { order: 8, childName: 'cbc:UUID', max: 1, classRef: UdtIdentifier },
  issueDate: { order: 9, childName: 'cbc:IssueDate', max: 1, classRef: UdtDate },
  issueTime: { order: 10, childName: 'cbc:IssueTime', max: 1, classRef: UdtTime },
  dueDate: { order: 11, childName: 'cbc:DueDate', max: 1, classRef: UdtDate },
  invoiceTypeCode: { order: 12, childName: 'cbc:InvoiceTypeCode', max: 1, classRef: UdtCode },
  notes: { order: 13, childName: 'cbc:Note', classRef: UdtText },
  taxPointDate: { order: 14, childName: 'cbc:TaxPointDate', max: 1, classRef: UdtDate },
  documentCurrencyCode: { order: 15, childName: 'cbc:DocumentCurrencyCode', max: 1, classRef: UdtCode },
  taxCurrencyCode: { order: 16, childName: 'cbc:TaxCurrencyCode', max: 1, classRef: UdtCode },
  pricingCurrencyCode: { order: 17, childName: 'cbc:PricingCurrencyCode', max: 1, classRef: UdtCode },
  paymentCurrencyCode: { order: 18, childName: 'cbc:PaymentCurrencyCode', max: 1, classRef: UdtCode },
  paymentAlternativeCurrencyCode: {
    order: 19,
    childName: 'cbc:PaymentAlternativeCurrencyCode',
    max: 1,
    classRef: UdtCode,
  },
  accountingCostCode: { order: 20, childName: 'cbc:AccountingCostCode', max: 1, classRef: UdtCode },
  accountingCost: { order: 21, childName: 'cbc:AccountingCost', max: 1, classRef: UdtText },
  lineCountNumeric: { order: 22, childName: 'cbc:LineCountNumeric', max: 1, classRef: UdtNumeric },
  buyerReference: { order: 23, childName: 'cbc:BuyerReference', max: 1, classRef: UdtText },
  invoicePeriods: { order: 24, childName: 'cac:InvoicePeriod', classRef: PeriodType },
  orderReference: { order: 25, childName: 'cac:OrderReference', max: 1, classRef: OrderReference },
  billingReferences: { order: 26, childName: 'cac:BillingReference', classRef: BillingReference },
  despatchDocumentReferences: {
    order: 27,
    childName: 'cac:DespatchDocumentReference',
    classRef: DespatchDocumentReference,
  },
  receiptDocumentReferences: {
    order: 28,
    childName: 'cac:ReceiptDocumentReference',
    classRef: ReceiptDocumentReference,
  },
  statementDocumentReferences: {
    order: 29,
    childName: 'cac:StatementDocumentReference',
    classRef: StatementDocumentReference,
  },
  originatorDocumentReferences: {
    order: 30,
    childName: 'cac:OriginatorDocumentReference',
    classRef: OriginatorDocumentReference,
  },
  contractDocumentReferences: {
    order: 31,
    childName: 'cac:ContractDocumentReference',
    classRef: ContractDocumentReference,
  },
  additionalDocumentReferences: {
    order: 32,
    childName: 'cac:AdditionalDocumentReference',
    classRef: AdditionalDocumentReference,
  },
  projectReferences: { order: 33, childName: 'cac:ProjectReference', classRef: ProjectReference },
  signatures: { order: 34, childName: 'cac:Signature', classRef: Signature },
  accountingSupplierParty: {
    order: 35,
    childName: 'cac:AccountingSupplierParty',
    max: 1,
    classRef: AccountingSupplierParty,
  },
  accountingCustomerParty: {
    order: 36,
    childName: 'cac:AccountingCustomerParty',
    max: 1,
    classRef: AccountingCustomerParty,
  },
  payeeParty: { order: 37, childName: 'cac:PayeeParty', max: 1, classRef: PayeeParty },
  buyerCustomerParty: { order: 38, childName: 'cac:BuyerCustomerParty', max: 1, classRef: BuyerCustomerParty },
  sellerSupplierParty: { order: 39, childName: 'cac:SellerSupplierParty', max: 1, classRef: SellerSupplierParty },
  taxRepresentativeParty: {
    order: 40,
    childName: 'cac:TaxRepresentativeParty',
    max: 1,
    classRef: TaxRepresentativeParty,
  },
  deliveries: { order: 41, childName: 'cac:Delivery', classRef: Delivery },
  deliveryTerms: { order: 42, childName: 'cac:DeliveryTerms', max: 1, classRef: DeliveryTerms },
  paymentMeans: { order: 43, childName: 'cac:PaymentMeans', classRef: PaymentMeans },
  paymentTerms: { order: 44, childName: 'cac:PaymentTerms', classRef: PaymentTerms },
  prepaidPayments: { order: 45, childName: 'cac:PrepaidPayment', classRef: PrepaidPayment },
  allowanceCharges: { order: 46, childName: 'cac:AllowanceCharge', classRef: AllowanceCharge },
  taxExchangeRate: { order: 47, childName: 'cac:TaxExchangeRate', max: 1, classRef: TaxExchangeRate },
  pricingExchangeRate: { order: 48, childName: 'cac:PricingExchangeRate', max: 1, classRef: PricingExchangeRate },
  paymentExchangeRate: { order: 49, childName: 'cac:PaymentExchangeRate', max: 1, classRef: PaymentExchangeRate },
  paymentAlternativeExchangeRate: {
    order: 50,
    childName: 'cac:PaymentAlternativeExchangeRate',
    max: 1,
    classRef: PaymentAlternativeExchangeRate,
  },
  taxTotals: { order: 51, childName: 'cac:TaxTotal', classRef: TaxTotal },
  withholdingTaxTotals: { order: 52, childName: 'cac:WithholdingTaxTotal', classRef: WithholdingTaxTotal },
  legalMonetaryTotal: { order: 53, childName: 'cac:LegalMonetaryTotal', max: 1, classRef: LegalMonetaryTotal },
  invoiceLines: { order: 54, childName: 'cac:InvoiceLine', classRef: InvoiceLine },
};
