import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtText } from '../datatypes/udt';
import { DocumentReference } from './DocumentReference';

/**
 * cac:TransactionConditionsType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TransactionConditionsType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  actionCode: { order: 2, attributeName: 'cbc:ActionCode', max: 1, classRef: UdtCode },
  descriptions: { order: 3, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  documentReferences: {
    order: 4,
    attributeName: 'cac:DocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
};

type AllowedParams = {
  /** An identifier for conditions of the transaction, typically purchase/sales conditions. */
  id?: string | UdtIdentifier;
  /** A code signifying a type of action relating to sales or payment conditions. */
  actionCode?: string | UdtCode;
  /** Text describing the transaction conditions. */
  descriptions?: (string | UdtText)[];
  /** A document associated with these transaction conditions. */
  documentReferences?: DocumentReference[];
};

class TransactionConditions extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TransactionConditions');
  }
}

export { TransactionConditions, AllowedParams as TransactionConditionsParams };
