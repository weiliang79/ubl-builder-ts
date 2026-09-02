import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { BillingReferenceLine } from './BillingReferenceLine';
import { AdditionalDocumentReference, DocumentReference, InvoiceDocumentReference } from './DocumentReference';

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  invoiceDocumentReference: {
    order: 1,
    attributeName: 'cac:InvoiceDocumentReference',
    max: 1,
    classRef: () => InvoiceDocumentReference,
  },
  selfBilledInvoiceDocumentReference: {
    order: 2,
    attributeName: 'cac:SelfBilledInvoiceDocumentReference',
    max: 1,
    classRef: () => DocumentReference,
  },
  creditNoteDocumentReference: {
    order: 3,
    attributeName: 'cac:CreditNoteDocumentReference',
    max: 1,
    classRef: () => DocumentReference,
  },
  selfBilledCreditNoteDocumentReference: {
    order: 4,
    attributeName: 'cac:SelfBilledCreditNoteDocumentReference',
    max: 1,
    classRef: () => DocumentReference,
  },
  debitNoteDocumentReference: {
    order: 5,
    attributeName: 'cac:DebitNoteDocumentReference',
    max: 1,
    classRef: () => DocumentReference,
  },
  reminderDocumentReference: {
    order: 6,
    attributeName: 'cac:ReminderDocumentReference',
    max: 1,
    classRef: () => DocumentReference,
  },
  additionalDocumentReference: {
    order: 7,
    attributeName: 'cac:AdditionalDocumentReference',
    max: 1,
    classRef: () => AdditionalDocumentReference,
  },
  billingReferenceLine: {
    order: 8,
    attributeName: 'cac:BillingReferenceLine',
    max: undefined,
    classRef: () => BillingReferenceLine,
  },
};

type AllowedParams = {
  /** A reference to an invoice */
  invoiceDocumentReference?: InvoiceDocumentReference;

  // /** A reference to a self-billed invoice */
  // selfBilledInvoiceDocumentReference: null;

  // /** A reference to a credit note */
  // creditNoteDocumentReference: null;

  // /** A reference to a self-billed credit note */
  // selfBilledCreditNoteDocumentReference: null;

  // /** A reference to a debit note */
  // debitNoteDocumentReference: null;

  // /** A reference to a reminder */
  // reminderDocumentReference: null;

  /** A reference to an additional document */
  additionalDocumentReference?: AdditionalDocumentReference;

  selfBilledInvoiceDocumentReference?: DocumentReference;
  creditNoteDocumentReference?: DocumentReference;
  selfBilledCreditNoteDocumentReference?: DocumentReference;
  debitNoteDocumentReference?: DocumentReference;
  reminderDocumentReference?: DocumentReference;
  /** A line in a billing document. */
  billingReferenceLine?: BillingReferenceLine[];
};

/**
 * A class to define a reference to a billing document
 * More info http://www.datypic.com/sc/ubl21/e-cac_BillingReference.html
 */
class BillingReference extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:BillingReference');
  }

  /**
   *
   * @param value
   */
  setInvoiceDocumentReference(value: InvoiceDocumentReference) {
    if (value instanceof InvoiceDocumentReference) {
      this.attributes.invoiceDocumentReference = value;
    } else {
      throw new Error('this action is not suported yet');
    }

    return this;
  }

  /**
   *
   * @param value
   */
  setAdditionalDocumentReference(value: AdditionalDocumentReference) {
    if (value instanceof AdditionalDocumentReference) {
      this.attributes.additionalDocumentReference = value;
    } else {
      throw new Error('this action is not suported yet');
    }

    return this;
  }
}

export { BillingReference, AllowedParams as BillingReferenceParams };
