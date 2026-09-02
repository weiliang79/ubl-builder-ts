import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier } from '../datatypes/udt';

/**
 * cac:CreditAccountType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:CreditAccountType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  accountID: { order: 1, attributeName: 'cbc:AccountID', max: 1, classRef: UdtIdentifier },
};

type AllowedParams = {
  /** An identifier for this credit account. */
  accountID: string | UdtIdentifier;
};

class CreditAccount extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:CreditAccount');
  }
}

export { CreditAccount, AllowedParams as CreditAccountParams };
