import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtName } from '../datatypes/udt';

/**
 * cac:ItemPropertyGroupType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ItemPropertyGroupType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  name: { order: 2, attributeName: 'cbc:Name', max: 1, classRef: UdtName },
  importanceCode: { order: 3, attributeName: 'cbc:ImportanceCode', max: 1, classRef: UdtCode },
};

type AllowedParams = {
  /** An identifier for this group of item properties. */
  id: string | UdtIdentifier;
  /** The name of this item property group. */
  name?: string | UdtName;
  /** A code signifying the importance of this property group in using it to describe a required Item. */
  importanceCode?: string | UdtCode;
};

class ItemPropertyGroup extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ItemPropertyGroup');
  }
}

export { ItemPropertyGroup, AllowedParams as ItemPropertyGroupParams };
