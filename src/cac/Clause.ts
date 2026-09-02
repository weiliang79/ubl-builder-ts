import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier, UdtText } from '../datatypes/udt';

/**
 * cac:ClauseType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ClauseType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  contents: { order: 2, attributeName: 'cbc:Content', max: undefined, classRef: UdtText },
};

type AllowedParams = {
  /** An identifier for this clause. */
  id?: string | UdtIdentifier;
  /** The text of this clause. */
  contents?: (string | UdtText)[];
};

class Clause extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Clause');
  }
}

export { Clause, AllowedParams as ClauseParams, Clause as PenaltyClause };
