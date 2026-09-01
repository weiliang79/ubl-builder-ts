import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier } from '../datatypes/udt';
import { Clause } from './Clause';
import { DocumentReference } from './DocumentReference';
import { Party } from './Party';
import { PayeeFinancialAccount } from './PayeeFinancialAccount';

/**
 * cac:TradeFinancingType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TradeFinancingType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  financingInstrumentCode: { order: 2, attributeName: 'cbc:FinancingInstrumentCode', max: 1, classRef: UdtCode },
  contractDocumentReference: {
    order: 3,
    attributeName: 'cac:ContractDocumentReference',
    max: 1,
    classRef: () => DocumentReference,
  },
  documentReferences: {
    order: 4,
    attributeName: 'cac:DocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  financingParty: { order: 5, attributeName: 'cac:FinancingParty', max: 1, classRef: () => Party },
  financingFinancialAccount: {
    order: 6,
    attributeName: 'cac:FinancingFinancialAccount',
    max: 1,
    classRef: () => PayeeFinancialAccount,
  },
  clauses: { order: 7, attributeName: 'cac:Clause', max: undefined, classRef: () => Clause },
};

type AllowedParams = {
  /** An identifier for this trade financing instrument. */
  id?: string | UdtIdentifier;
  /** A code signifying the type of this financing instrument. */
  financingInstrumentCode?: string | UdtCode;
  /** A reference to a contract document. */
  contractDocumentReference?: DocumentReference;
  /** A reference to a document associated with this trade financing instrument. */
  documentReferences?: DocumentReference[];
  /** The financing party (bank or other enabled party). */
  financingParty: Party;
  /** An internal bank account used by the bank or its first agent to manage the line of credit granted to the financing requester. */
  financingFinancialAccount?: PayeeFinancialAccount;
  /** A clause applicable to this trade financing instrument. */
  clauses?: Clause[];
};

class TradeFinancing extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TradeFinancing');
  }
}

export { TradeFinancing, AllowedParams as TradeFinancingParams };
