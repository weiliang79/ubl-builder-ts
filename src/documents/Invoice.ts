import {
  AccountingCustomerParty,
  AccountingSupplierParty,
  AdditionalDocumentReference,
  AdditionalDocumentReferenceParams,
  AllowanceCharge,
  BillingReference,
  BillingReferenceParams,
  BuyerCustomerParty,
  ContractDocumentReference,
  ContractDocumentReferenceParams,
  CustomerPartyParams,
  Delivery,
  DeliveryTerms,
  DeliveryTermsParams,
  DeliveryTypeParams,
  DespatchDocumentReference,
  DespatchDocumentReferenceParams,
  ExchangeRateParams,
  InvoiceLine,
  InvoiceLineParams,
  LegalMonetaryTotal,
  MonetaryTotalParams,
  OrderReference,
  OrderReferenceParams,
  OriginatorDocumentReference,
  OriginatorDocumentReferenceParams,
  PartyParams,
  PayeeParty,
  PaymentAlternativeExchangeRate,
  PaymentExchangeRate,
  PaymentMeans,
  PaymentMeansParams,
  PaymentTerms,
  PaymentTermsTypeParams,
  PaymentTypeParams,
  PeriodType,
  PeriodTypeParams,
  PrepaidPayment,
  PricingExchangeRate,
  ProjectReference,
  ProjectReferenceParams,
  ReceiptDocumentReference,
  ReceiptDocumentReferenceParams,
  SellerSupplierParty,
  Signature,
  SignatureParams,
  StatementDocumentReference,
  StatementDocumentReferenceParams,
  SupplierPartyTypeParams,
  TaxExchangeRate,
  TaxRepresentativeParty,
  TaxTotal,
  TaxTotalTypeParams,
  WithholdingTaxTotal,
} from '../cac';

import { UBLExtensions } from '../ext';

import { UBLVersionID, UBLVersionIDAttributes } from '../datatypes/cbc';
import {
  UdtCode,
  UdtCodeAttributes,
  UdtDate,
  UdtIdentifier,
  UdtIdentifierAttributes,
  UdtIndicator,
  UdtNumeric,
  UdtNumericAttributes,
  UdtText,
  UdtTextAttributes,
  UdtTime,
} from '../datatypes/udt';

import { IGenericKeyValue } from '../core/GenericAggregateComponent';
import { ParsedElement, parseUblJson, parseXml } from '../core/parse';
import { toUblJson, toXmlString, UblJsonNamespaces } from '../core/serialize';
import { NodeSource, XmlNode } from '../core/xmlNode';
import { INVOICE_CHILDREN_MAP } from './ChildrenMap';
import { paramsFrom } from './fromParsed';

export default class Invoice {
  /** Attributes on the Invoice root element — namespace declarations and the like. */
  private properties: Record<string, string> = {};
  private children: IGenericKeyValue<any> = {};

  /**
   *
   * @param id Invoice id
   * @param options Invoice options
   */
  /**
   * @param id an identifier for this document, assigned by the sender
   *           (cbc:ID). Optional so a document can be built up in stages.
   */
  constructor(id?: string) {
    if (id !== undefined) this.setID(id);
  }

  /**
   * Read an invoice back from XML.
   *
   * The inverse of {@link getXml}. Children are matched against
   * INVOICE_CHILDREN_MAP and assigned through the same path a caller's setter
   * uses, so a parsed document is indistinguishable from a built one.
   *
   * Root attributes come back as properties, which is what makes a round trip
   * byte-identical: the namespace declarations and xsi:schemaLocation are part
   * of the document, not something the profile re-derives.
   *
   * An element this library cannot represent, or one that appears more often
   * than UBL allows, is reported rather than dropped. 32 UBL children still
   * have no component class, and a document carrying one would otherwise lose
   * it silently on the way through.
   */
  static fromXml(xml: string): Invoice {
    return Invoice.fromParsed(parseXml(xml));
  }

  /**
   * Read an invoice back from OASIS UBL JSON (Alternative Representation v2.0).
   *
   * The inverse of {@link getJson}. The namespaces the JSON form hoists to
   * `_D` / `_A` / `_B` / `_E` are not properties of the invoice, so a document
   * arriving this way has none set; call the profile's `defaults()` before
   * rendering it as XML.
   */
  static fromJson(document: Record<string, unknown>): Invoice {
    return Invoice.fromParsed(parseUblJson(document));
  }

  private static fromParsed(root: ParsedElement): Invoice {
    const invoice = new Invoice();
    Object.entries(root.attributes).forEach(([key, value]) => invoice.addProperty(key, value));

    const problems: string[] = [];
    const params = paramsFrom(root, INVOICE_CHILDREN_MAP, root.name, problems);
    if (problems.length) {
      throw new Error(`this document cannot be read: ${problems.join('; ')}`);
    }

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((item) => invoice.assignChild(key, item));
      else invoice.assignChild(key, value);
    });

    return invoice;
  }

  /** Add an attribute to the Invoice root, typically a namespace declaration. */
  addProperty(key: string, value: string): Invoice {
    this.properties[key] = value;
    return this;
  }

  /** Remove an attribute from the Invoice root. */
  removeProperty(key: string): Invoice {
    delete this.properties[key];
    return this;
  }

  setDefaultProperties() {
    const defaultProperties = [
      { key: 'xmlns', value: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2' },
      { key: 'xmlns:cac', value: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2' },
      { key: 'xmlns:cbc', value: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2' },
      { key: 'xmlns:ds', value: 'http://www.w3.org/2000/09/xmldsig#' },
      { key: 'xmlns:ext', value: 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2' },
      { key: 'xmlns:xades', value: 'http://uri.etsi.org/01903/v1.3.2#' },
      { key: 'xmlns:xades141', value: 'http://uri.etsi.org/01903/v1.4.1#' },
      { key: 'xmlns:xsi', value: 'http://www.w3.org/2001/XMLSchema-instance' },
      {
        key: 'xsi:schemaLocation',
        value:
          'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2 http://docs.oasis-open.org/ubl/os-UBL-2.1/xsd/maindoc/UBL-Invoice-2.1.xsd',
      },
    ];

    defaultProperties.forEach((item) => this.addProperty(item.key, item.value));
  }

  /**
   * An identifier for the Extension assigned by the creator of the extension.
   * @param value
   */
  setUBLExtensions(value: UBLExtensions): Invoice {
    this.validateInstanceOf(value, [UBLExtensions]);

    this.children.UBLExtensions = value;
    return this;
  }

  /**
   * 2. Identifies the earliest version of the UBL 2 schema for this document type that defines
   * all of the elements that might be encountered in the current instance.
   * @param value
   * @param attributes
   */
  setUBLVersionID(value: string | UBLVersionID, attributes?: UBLVersionIDAttributes) {
    this.validateInstanceOf(value, ['string', UBLVersionID]);
    this.children.UBLVersionID = value instanceof UBLVersionID ? value : new UBLVersionID(value, attributes);

    return this;
  }

  /**
   * 3. Identifies a user-defined customization of UBL for a specific use.
   * @param value
   * @param attributes
   */
  setCustomizationID(value: string | UdtIdentifier, attributes?: UdtIdentifierAttributes): Invoice {
    this.validateInstanceOf(value, ['string', UdtIdentifier]);
    this.children.customizationID = value instanceof UdtIdentifier ? value : new UdtIdentifier(value, attributes);

    return this;
  }

  /**
   * 4. Identifies a user-defined profile of the customization of UBL being used.
   * @param value value
   * @param attributes attributes
   */
  setProfileID(value: string | UdtIdentifier, attributes?: UdtIdentifierAttributes): Invoice {
    this.validateInstanceOf(value, ['string', UdtIdentifier]);

    this.children.profileID = value instanceof UdtIdentifier ? value : new UdtIdentifier(value, attributes);
    return this;
  }

  /**
   * 5. Identifies an instance of executing a profile, to associate all transactions in a collaboration.
   * @param value value
   * @param attributes attributes
   */
  setProfileExecutionID(value: string | UdtIdentifier, attributes?: UdtIdentifierAttributes) {
    this.validateInstanceOf(value, ['string', UdtIdentifier]);
    this.children.profileExecutionID = value instanceof UdtIdentifier ? value : new UdtIdentifier(value, attributes);
    return this;
  }

  /**
   * 6. An identifier for this document, assigned by the sender.
   * @param value value
   * @param attributes options
   */
  setID(value: string | UdtIdentifier, attributes = {}): Invoice {
    this.validateInstanceOf(value, ['string', UdtIdentifier]);

    this.children.id = value instanceof UdtIdentifier ? value : new UdtIdentifier(value, attributes);

    return this;
  }

  /**
   *
   * @param raw if true returns strin value, or else Udt identifier object
   */
  getID(raw = true): string | UdtIdentifier {
    return raw ? this.children.id.content : this.children.id;
  }

  /**
   * 7. Indicates whether this document is a copy (true) or not (false).
   * @param { Boolean } value
   * @returns {Invoice}
   */
  setCopyIndicator(value: boolean): Invoice {
    this.validateInstanceOf(value, ['boolean']);

    this.children.copyIndicator = new UdtIndicator(value);
    return this;
  }

  /**
   * 8. A universally unique identifier for an instance of this document.
   * @param { String } value
   * @param { UdtIdentifierAttributes } attributes
   * @returns {Invoice}
   */
  setUUID(value: string | UdtIdentifier, attributes?: UdtIdentifierAttributes): Invoice {
    this.validateInstanceOf(value, ['string', UdtIdentifier]);

    this.children.uuid = value instanceof UdtIdentifier ? value : new UdtIdentifier(value, attributes);
    return this;
  }

  /**
   * 9. The date, assigned by the sender, on which this document was issued.
   * @param value
   */
  setIssueDate(value: string): Invoice {
    this.validateInstanceOf(value, ['string']);
    this.children.issueDate = new UdtDate(value);
    return this;
  }

  /**
   * 10. The time, assigned by the sender, at which this document was issued.
   * @param value
   */
  setIssueTime(value: string): Invoice {
    this.validateInstanceOf(value, ['string']);

    this.children.issueTime = new UdtTime(value);
    return this;
  }

  /**
   * 11. A code signifying the type of the Invoice.
   * @param value
   */
  setDueDate(value: string): Invoice {
    this.validateInstanceOf(value, ['string']);
    this.children.dueDate = new UdtDate(value);
    return this;
  }

  /**
   * 12. A code signifying the type of the Invoice.
   * @param { String } value
   * @param { UdtCodeAttributes } attributes
   * @returns {Invoice}
   */
  setInvoiceTypeCode(value: string | UdtCode, attributes?: UdtCodeAttributes): Invoice {
    this.validateInstanceOf(value, ['string']);

    this.children.invoiceTypeCode = value instanceof UdtCode ? value : new UdtCode(value, attributes);
    return this;
  }

  /**
   * 13. Free-form text pertinent to this document,
   * conveying information that is not contained explicitly in other structures.
   * @param value
   * @param attributes
   */
  addNote(value: string, attributes?: UdtTextAttributes): Invoice {
    if (value === null) {
      throw new Error('invalid value');
    }

    if (!this.children.notes) {
      this.children.notes = [];
    }

    this.children.notes.push(new UdtText(value, attributes));
    return this;
  }

  /**
   * 14. The date of the Invoice, used to indicate the point at which tax becomes applicable.
   * @param value
   */
  setTaxPointDate(value: string | UdtDate): Invoice {
    this.validateInstanceOf(value, ['string', UdtDate]);

    this.children.taxPointDate = value instanceof UdtDate ? value : new UdtDate(value);
    return this;
  }

  /**
   * 15. A code signifying the default currency for this document
   * @param value
   * @param attributes
   */
  setDocumentCurrencyCode(value: string | UdtCode, attributes?: UdtCodeAttributes): Invoice {
    // if (value === null) {
    //   this.children.documentCurrencyCode = null;
    // }

    this.children.documentCurrencyCode = value instanceof UdtCode ? value : new UdtCode(value, attributes);

    return this;
  }

  /**
   * 16. A code signifying the currency used for tax amounts in the Invoice
   * @param value
   * @param attributes
   */
  setTaxCurrencyCode(value: string | UdtCode, attributes?: UdtCodeAttributes): Invoice {
    // if (value === null) {
    //   this.taxCurrencyCode = null;
    // }

    this.children.taxCurrencyCode = value instanceof UdtCode ? value : new UdtCode(value, attributes);
    return this;
  }

  /**
   * 17. A code signifying the currency used for prices in the Invoice
   * @param value exmaples: COP | USD | AED ...
   * @param attributes
   */
  setPricingCurrencyCode(value: string | UdtCode, attributes?: UdtCodeAttributes): Invoice {
    // if (value === null) {
    //   this.pricingCurrencyCode = null;
    // }

    this.children.pricingCurrencyCode = value instanceof UdtCode ? value : new UdtCode(value, attributes);

    return this;
  }

  /**
   * 18. A code signifying the currency used for payment in the Invoice
   * @param value exmaples: COP | USD | AED ...
   * @param attributes
   */
  setPaymentCurrencyCode(value: string | UdtCode, attributes?: UdtCodeAttributes): Invoice {
    // if (value === null) {
    //   this.paymentCurrencyCode = null;
    // }

    this.children.paymentCurrencyCode = value instanceof UdtCode ? value : new UdtCode(value, attributes);
    return this;
  }

  /**
   * 19. A code signifying the alternative currency used for payment in the Invoice.
   * @param value  exmaples: COP | USD | AED ...
   * @param attributes
   */
  setPaymentAlternativeCurrencyCode(value: string | UdtCode, attributes?: UdtCodeAttributes): Invoice {
    // if (value === null) {
    //   this.paymentAlternativeCurrencyCode = null;
    // }

    this.children.paymentAlternativeCurrencyCode = value instanceof UdtCode ? value : new UdtCode(value, attributes);
    return this;
  }

  /**
   * 20. The buyer's accounting code, applied to the Invoice as a whole.
   * @param value exmaples: COP | USD | AED ...
   * @param attributes
   */
  setAccountingCostCode(value: string | UdtCode, attributes?: UdtCodeAttributes): Invoice {
    // if (value === null) {
    //   this.accountingCostCode = null;
    // }

    this.children.accountingCostCode = value instanceof UdtCode ? value : new UdtCode(value, attributes);
    return this;
  }

  /**
   * 21. The buyer's accounting code, applied to the Invoice as a whole, expressed as text.
   * @param { String } value
   * @param { UdtTextAttributes } attributes options
   * @returns {Invoice}
   */
  setAccountingCost(value: string | UdtText, attributes?: UdtTextAttributes): Invoice {
    this.children.accountingCost = value instanceof UdtText ? value : new UdtText(value, attributes);

    return this;
  }

  /**
   * 22. The number of lines in the document
   * @param value
   * @param attributes
   */
  setLineCountNumeric(value: string | UdtNumeric, attributes?: UdtNumericAttributes): Invoice {
    this.children.lineCountNumeric = value instanceof UdtNumeric ? value : new UdtNumeric(value, attributes);
    return this;
  }

  /**
   * 23. A reference provided by the buyer used for internal routing of the document
   * @param value
   * @param attributes
   */
  setBuyerReference(value: string | UdtText, attributes?: UdtTextAttributes) {
    // if (value === null) {
    //   this.buyerReference = null;
    // }

    this.children.buyerReference = value instanceof UdtText ? value : new UdtText(value, attributes);
    return this;
  }

  /**
   * 24. A period to which the Invoice applies.
   * @param value
   */
  addInvoicePeriod(value: PeriodType | PeriodTypeParams): Invoice {
    if (!this.children.invoicePeriods) this.children.invoicePeriods = [];
    const itemToPush = value instanceof PeriodType ? value : new PeriodType(value);
    this.children.invoicePeriods.push(itemToPush);

    return this;
  }

  clearInvoicePeriods() {
    this.children.invoicePeriods = null;
  }

  /**
   * 25. A reference to the Order with which this Invoice is associated
   * @param value
   */
  setOrderReference(value: OrderReference | OrderReferenceParams): Invoice {
    // if (input === null) {
    //   this.orderReference = null;
    // }

    this.children.orderReference = value instanceof OrderReference ? value : new OrderReference(value);

    return this;
  }

  /**
   * 26.  A reference to a billing document associated with this document.
   * @param value
   */
  addBillingReference(value: BillingReference | BillingReferenceParams): Invoice {
    if (!this.children.billingReferences) {
      this.children.billingReferences = [];
    }

    const itemToPush = value instanceof BillingReference ? value : new BillingReference(value);
    this.children.billingReferences.push(itemToPush);

    return this;
  }

  /**
   * 27.  A reference to a Despatch Advice associated with this document.
   * @param input
   */
  addDespatchDocumentReference(input: DespatchDocumentReference | DespatchDocumentReferenceParams): Invoice {
    if (!this.children.despatchDocumentReferences) {
      this.children.despatchDocumentReferences = [];
    }
    const itemToPush = input instanceof DespatchDocumentReference ? input : new DespatchDocumentReference(input);
    this.children.despatchDocumentReferences.push(itemToPush);

    return this;
  }

  /**
   *
   * @param { ReceiptDocumentReferenceParams } input
   * @returns {Invoice}
   */
  /**
   * 28. A reference to a Receipt Advice associated with this document.
   * @param input
   */
  addReceiptDocumentReference(input: ReceiptDocumentReference | ReceiptDocumentReferenceParams): Invoice {
    if (!this.children.receiptDocumentReferences) {
      this.children.receiptDocumentReferences = [];
    }
    const itemToPush = input instanceof ReceiptDocumentReference ? input : new ReceiptDocumentReference(input);
    this.children.receiptDocumentReferences.push(itemToPush);

    return this;
  }

  /**
   * 29. A reference to a Receipt Advice associated with this document.
   * @param { StatementDocumentReferenceParams } input
   * @returns {Invoice}
   */
  addStatementDocumentReference(input: StatementDocumentReference | StatementDocumentReferenceParams): Invoice {
    if (!this.children.statementDocumentReferences) {
      this.children.statementDocumentReferences = [];
    }
    const itemToPush = input instanceof StatementDocumentReference ? input : new StatementDocumentReference(input);

    this.children.statementDocumentReferences.push(itemToPush);

    return this;
  }

  /**
   * 30. A reference to an originator document associated with this document.
   * @param input
   */
  addOriginatorDocumentReference(input: OriginatorDocumentReference | OriginatorDocumentReferenceParams): Invoice {
    if (!this.children.originatorDocumentReferences) {
      this.children.originatorDocumentReferences = [];
    }
    const itemToPush = input instanceof OriginatorDocumentReference ? input : new OriginatorDocumentReference(input);
    this.children.originatorDocumentReferences.push(itemToPush);
    return this;
  }

  /**
   * 31. A reference to a contract associated with this document.
   * @param input
   */
  addContractDocumentReference(input: ContractDocumentReference | ContractDocumentReferenceParams): Invoice {
    if (!this.children.contractDocumentReferences) {
      this.children.contractDocumentReferences = [];
    }
    const itemToPush = input instanceof ContractDocumentReference ? input : new ContractDocumentReference(input);
    this.children.contractDocumentReferences.push(itemToPush);
    return this;
  }

  /**
   * 32. A reference to an additional document associated with this document.
   * @param input
   */
  addAdditionalDocumentReference(input: AdditionalDocumentReference | AdditionalDocumentReferenceParams): Invoice {
    if (!this.children.additionalDocumentReferences) {
      this.children.additionalDocumentReferences = [];
    }
    const itemToPush = input instanceof AdditionalDocumentReference ? input : new AdditionalDocumentReference(input);
    this.children.additionalDocumentReferences.push(itemToPush);
    return this;
  }

  /**
   *
   * @param input
   */
  addProjectReference(input: ProjectReference | ProjectReferenceParams): Invoice {
    if (!this.children.projectReferences) {
      this.children.projectReferences = [];
    }
    const itemToPush = input instanceof ProjectReference ? input : new ProjectReference(input);
    this.children.projectReferences.push(itemToPush);
    return this;
  }

  /**
   * 34. A signature applied to this document.
   * @param { SignatureParams } input
   * @returns {Invoice}
   */
  addSignature(value: Signature | SignatureParams): Invoice {
    if (!this.children.signatures) {
      this.children.signatures = [];
    }
    const itemToPush = value instanceof Signature ? value : new Signature(value);
    this.children.signatures.push(itemToPush);
    return this;
  }

  /**
   * 35. The accounting supplier party.
   * @param { SupplierPartyTypeParams } input
   * @returns {Invoice}
   */
  setAccountingSupplierParty(value: AccountingSupplierParty): Invoice {
    this.children.accountingSupplierParty =
      value instanceof AccountingSupplierParty ? value : new AccountingSupplierParty(value);
    return this;
  }

  /**
   *
   * @param { AccountingCustomerParty } input
   * @returns {Invoice}
   */
  /**
   * 36. [required] The accounting customer party.
   * @param input
   */
  setAccountingCustomerParty(value: AccountingCustomerParty): Invoice {
    this.children.accountingCustomerParty =
      value instanceof AccountingCustomerParty ? value : new AccountingCustomerParty(value);
    return this;
  }

  /**
   * 37. The payee.
   * @param value
   */
  setPayeeParty(value: PayeeParty | PartyParams): Invoice {
    return this.assignChild('payeeParty', value);
  }

  /**
   * 38. The buyer.
   * @param value
   */
  setBuyerCustomerParty(value: BuyerCustomerParty | CustomerPartyParams): Invoice {
    return this.assignChild('buyerCustomerParty', value);
  }

  /**
   * 39. The seller.
   * @param value
   */
  setSellerSupplierParty(value: SellerSupplierParty | SupplierPartyTypeParams): Invoice {
    return this.assignChild('sellerSupplierParty', value);
  }

  /**
   * 40. The tax representative.
   * @param { TaxRepresentativeParty | PartyParams  } input
   * @returns {Invoice}
   */
  setTaxRepresentativeParty(input: TaxRepresentativeParty | PartyParams) {
    this.children.taxRepresentativeParty =
      input instanceof TaxRepresentativeParty ? input : new TaxRepresentativeParty(input);
  }

  /**
   *
   * @param value
   */
  addDelivery(value: Delivery | DeliveryTypeParams) {
    if (!this.children.deliveries) {
      this.children.deliveries = [];
    }
    const itemToPush = value instanceof Delivery ? value : new Delivery(value);

    this.children.deliveries.push(itemToPush);
    return this;
  }

  /**
   * 42
   * @param value
   */
  setDeliveryTerms(value: DeliveryTerms | DeliveryTermsParams): Invoice {
    this.children.deliveryTerms = value instanceof DeliveryTerms ? value : new DeliveryTerms(value);
    return this;
  }

  /**
   *
   * @param value
   */
  addPaymentMeans(value: PaymentMeans | PaymentMeansParams): Invoice {
    if (!this.children.paymentMeans) {
      this.children.paymentMeans = [];
    }
    const itemToPush = value instanceof PaymentMeans ? value : new PaymentMeans(value);
    this.children.paymentMeans.push(itemToPush);
    return this;
  }

  /**
   * 44. A set of payment terms associated with this document.
   * @param value
   */
  addPaymentTerm(value: PaymentTerms | PaymentTermsTypeParams): Invoice {
    return this.assignChild('paymentTerms', value);
  }

  /**
   * 45 A prepaid payment.
   * @param value
   */
  addPrepaidPayment(value: PrepaidPayment | PaymentTypeParams): Invoice {
    if (!this.children.prepaidPayments) {
      this.children.prepaidPayments = [];
    }
    const itemToPush = value instanceof PrepaidPayment ? value : new PrepaidPayment(value);
    this.children.prepaidPayments.push(itemToPush);
    return this;
  }

  /**
   * 46 A discount or charge that applies to a price component..
   * @param value
   */
  addAllowanceCharge(value: AllowanceCharge): Invoice {
    if (!this.children.allowanceCharges) {
      this.children.allowanceCharges = [];
    }
    const itemToPush = value instanceof AllowanceCharge ? value : new AllowanceCharge(value);
    this.children.allowanceCharges.push(itemToPush);
    return this;
  }

  /**
   * 47. The exchange rate between the document currency and the tax currency.
   * @param value
   */
  setTaxExchangeRate(value: TaxExchangeRate | ExchangeRateParams): Invoice {
    return this.assignChild('taxExchangeRate', value);
  }

  /**
   * 48. The exchange rate between the document currency and the pricing currency.
   * @param value
   */
  setPricingExchangeRate(value: PricingExchangeRate | ExchangeRateParams): Invoice {
    return this.assignChild('pricingExchangeRate', value);
  }

  /**
   * 49 The exchange rate between the document currency and the payment currency.
   * @param {  } value
   */
  setPaymentExchangeRate(value: PaymentExchangeRate | ExchangeRateParams): Invoice {
    this.children.paymentExchangeRate = value instanceof PaymentExchangeRate ? value : new PaymentExchangeRate(value);
    return this;
  }

  /**
   * 50. The exchange rate between the document currency and the payment alternative currency.
   * @param value
   */
  setPaymentAlternativeExchangeRate(value: PaymentAlternativeExchangeRate | ExchangeRateParams): Invoice {
    return this.assignChild('paymentAlternativeExchangeRate', value);
  }

  /**
   * 51 The total amount of a specific type of tax
   * @param value
   */
  addTaxTotal(value: TaxTotal | TaxTotalTypeParams) {
    if (!this.children.taxTotals) {
      this.children.taxTotals = [];
    }

    const itemToPush = value instanceof TaxTotal ? value : new TaxTotal(value);
    this.children.taxTotals.push(itemToPush);
    return this;
  }

  /**
   * 52. The total withholding tax.
   * @param value
   */
  addWithholdingTaxTotal(value: WithholdingTaxTotal | TaxTotalTypeParams): Invoice {
    return this.assignChild('withholdingTaxTotals', value);
  }

  /**
   * 53 The total amount payable on the Invoice, including Allowances, Charges, and Taxes
   * @param value
   */
  setLegalMonetaryTotal(value: LegalMonetaryTotal | MonetaryTotalParams): Invoice {
    this.children.legalMonetaryTotal = value instanceof LegalMonetaryTotal ? value : new LegalMonetaryTotal(value);
    return this;
  }

  /**
   *
   *
   * @param {InvoiceLine | InvoiceLineParams} value
   */
  /**
   * 54. A line describing an invoice item
   * TODO: verify the use of custom mathTools class
   * @param value
   */
  addInvoiceLine(value: InvoiceLine | InvoiceLineParams): Invoice {
    if (!this.children.invoiceLines) {
      this.children.invoiceLines = [];
    }
    const invoiceLine = value instanceof InvoiceLine ? value : new InvoiceLine(value);

    this.children.invoiceLines.push(invoiceLine);
    return this;
  }

  // /*
  // #################################################################################
  // ############################      CUSTOM METHODS     ############################
  // #################################################################################
  // */

  /**
   * @param {String} taxId Tax's id to search
   * @param {Boolean} [asString=true] resturns as String
   * @returns { String | Number } Tax Total amount
   */
  /**
   *
   * @param taxId
   * @param asString
   */
  // findTaxTotalById(taxId: string, asString = true): string | number {
  //   const taxTotal: TaxTotal = (this.children.taxTotals || []).find(
  //     (tt: TaxTotal) => tt.getTaxSubtotals()[0].getTaxCategory().getTaxScheme().getId() === taxId,
  //   );

  //   const taxAmount = taxTotal ? fixDecimals(taxTotal.getTaxAmount()) : '0.00';
  //   return asString ? taxAmount : parseFloat(taxAmount);
  // }

  /**
   * @param value value
   * @param classRefs list of allowed classes
   */
  /**
   * Build and store a child using the class the document map names for it.
   *
   * The sixty setters above each restate their own class, which is why eight
   * children could sit in INVOICE_CHILDREN_MAP with nothing but a `throw new
   * Error('not implemented')` against them. Anything added from here on reads
   * the class from the map, so a child that exists in the map can always be
   * set, and `fromXml` assigns through the same path a caller would.
   */
  private assignChild(key: string, value: unknown, attributes?: Record<string, unknown>): Invoice {
    const entry = INVOICE_CHILDREN_MAP[key];
    if (!entry) throw new Error(`${key} is not a child of Invoice`);

    const ClassRef = entry.classRef as new (content: unknown, attributes?: unknown) => unknown;
    const built = value instanceof ClassRef ? value : new ClassRef(value, attributes);

    if (entry.max === undefined) {
      if (!this.children[key]) this.children[key] = [];
      this.children[key].push(built);
    } else {
      this.children[key] = built;
    }
    return this;
  }

  private validateInstanceOf(value: any, classRefs: any[]): void {
    // if(!value){
    //   this.children[attribute] = null
    // }

    const matchList = classRefs.filter((classRef) => {
      if (typeof classRef === 'string') {
        return typeof value === classRef;
      }
      return value instanceof classRef;
    });

    if (matchList.length === 0) {
      const classNames = classRefs.map((cr) => cr.name || cr);
      throw new Error('VAlue must to be instance of [ ' + classNames.join(' or ') + ']');
    }
  }

  /**
   *
   * @param pretty Pretty format
   * @param headless result without headers
   */
  /**
   * Describe the whole document as a neutral node.
   *
   * This is the entry point every serializer shares: `getXml` renders it as
   * XML, and an OASIS UBL JSON renderer works from the same tree.
   */
  toNode(): XmlNode {
    const children: XmlNode[] = [];

    Object.keys(INVOICE_CHILDREN_MAP)
      .filter((attKey) => this.children[attKey])
      // cbc/cac elements are an xsd:sequence — order is significant, and
      // MyInvois rejects an incorrect one as "Invalid Structure".
      .sort((a, b) => INVOICE_CHILDREN_MAP[a].order - INVOICE_CHILDREN_MAP[b].order)
      .forEach((attKey) => {
        const { childName, max } = INVOICE_CHILDREN_MAP[attKey];
        const value = this.children[attKey];
        const isChildAnArray = Array.isArray(value);

        if (max && max > 1 && !isChildAnArray) {
          throw new Error(`${attKey} must to be an Array`);
        }

        if (isChildAnArray) {
          value.forEach((item: NodeSource) => children.push({ name: childName, repeats: true, ...item.toNode() }));
        } else {
          children.push({ name: childName, ...value.toNode() });
        }
      });

    return { name: 'Invoice', attributes: { ...this.properties }, children };
  }

  /**
   *
   * @param pretty Pretty format
   * @param headless result without headers
   */
  getXml(pretty = false, headless = false): string {
    return toXmlString(this.toNode(), { pretty, headless });
  }

  /**
   * Render as OASIS UBL JSON (Alternative Representation v2.0) — the format
   * MyInvois accepts alongside XML.
   *
   * Namespaces come from the properties already set for XML output, so no
   * additional configuration is needed.
   */
  getJson(namespaces?: UblJsonNamespaces): Record<string, unknown> {
    return toUblJson(this.toNode(), namespaces);
  }
}
