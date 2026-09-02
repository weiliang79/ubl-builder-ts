import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtText } from '../datatypes/udt';
import { Address } from './Address';

/**
 * cac:TradingTermsType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TradingTermsType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  informations: { order: 1, attributeName: 'cbc:Information', max: undefined, classRef: UdtText },
  reference: { order: 2, attributeName: 'cbc:Reference', max: 1, classRef: UdtText },
  applicableAddress: { order: 3, attributeName: 'cac:ApplicableAddress', max: 1, classRef: () => Address },
};

type AllowedParams = {
  /** Text describing the terms of a trade agreement. */
  informations?: (string | UdtText)[];
  /** A reference quoting the basis of the terms */
  reference?: string | UdtText;
  /** The address at which these trading terms apply. */
  applicableAddress?: Address;
};

class TradingTerms extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TradingTerms');
  }
}

export { TradingTerms as HaulageTradingTerms, TradingTerms, AllowedParams as TradingTermsParams };
