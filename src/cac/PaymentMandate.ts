import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtAmount, UdtCode, UdtIdentifier, UdtNumeric } from '../datatypes/udt';
import { Clause } from './Clause';
import { Party } from './Party';
import { PayeeFinancialAccount } from './PayeeFinancialAccount';
import { EstimatedDeliveryPeriod, ValidityPeriod } from './Period';

/**
 * cac:PaymentMandateType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:PaymentMandateType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  mandateTypeCode: { order: 2, attributeName: 'cbc:MandateTypeCode', max: 1, classRef: UdtCode },
  maximumPaymentInstructionsNumeric: {
    order: 3,
    attributeName: 'cbc:MaximumPaymentInstructionsNumeric',
    max: 1,
    classRef: UdtNumeric,
  },
  maximumPaidAmount: { order: 4, attributeName: 'cbc:MaximumPaidAmount', max: 1, classRef: UdtAmount },
  signatureID: { order: 5, attributeName: 'cbc:SignatureID', max: 1, classRef: UdtIdentifier },
  payerParty: { order: 6, attributeName: 'cac:PayerParty', max: 1, classRef: () => Party },
  payerFinancialAccount: {
    order: 7,
    attributeName: 'cac:PayerFinancialAccount',
    max: 1,
    classRef: () => PayeeFinancialAccount,
  },
  validityPeriod: { order: 8, attributeName: 'cac:ValidityPeriod', max: 1, classRef: () => ValidityPeriod },
  paymentReversalPeriod: {
    order: 9,
    attributeName: 'cac:PaymentReversalPeriod',
    max: 1,
    classRef: () => EstimatedDeliveryPeriod,
  },
  clauses: { order: 10, attributeName: 'cac:Clause', max: undefined, classRef: () => Clause },
};

type AllowedParams = {
  /** An identifier for this payment mandate. */
  id?: string | UdtIdentifier;
  /** A code signifying the type of this payment mandate. */
  mandateTypeCode?: string | UdtCode;
  /** The number of maximum payment instructions allowed within the validity period. */
  maximumPaymentInstructionsNumeric?: string | UdtNumeric;
  /** The maximum amount to be paid within a single instruction. */
  maximumPaidAmount?: string | UdtAmount;
  /** An identifier for a signature applied by a signatory party. */
  signatureID?: string | UdtIdentifier;
  /** The payer party (if different from the debtor). */
  payerParty?: Party;
  /** The payer's financial account. */
  payerFinancialAccount?: PayeeFinancialAccount;
  /** The period during which this mandate is valid. */
  validityPeriod?: ValidityPeriod;
  /** The period of the reverse payment. */
  paymentReversalPeriod?: EstimatedDeliveryPeriod;
  /** A clause applicable to this payment mandate. */
  clauses?: Clause[];
};

class PaymentMandate extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:PaymentMandate');
  }
}

export { PaymentMandate, AllowedParams as PaymentMandateParams };
