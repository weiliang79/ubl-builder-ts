import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtText } from '../datatypes/udt';

/**
 * cac:ItemPropertyRangeType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ItemPropertyRangeType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  minimumValue: { order: 1, attributeName: 'cbc:MinimumValue', max: 1, classRef: UdtText },
  maximumValue: { order: 2, attributeName: 'cbc:MaximumValue', max: 1, classRef: UdtText },
};

type AllowedParams = {
  /** The minimum value in this range of values. */
  minimumValue?: string | UdtText;
  /** The maximum value in this range of values. */
  maximumValue?: string | UdtText;
};

class ItemPropertyRange extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ItemPropertyRange');
  }
}

export { ItemPropertyRange, AllowedParams as ItemPropertyRangeParams };
