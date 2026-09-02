import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtName, UdtQuantity, UdtText } from '../datatypes/udt';
import { RangeDimension } from './Dimension';
import { ItemPropertyGroup } from './ItemPropertyGroup';
import { ItemPropertyRange } from './ItemPropertyRange';
import { EstimatedDeliveryPeriod } from './Period';

/**
 * cac:ItemPropertyType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ItemPropertyType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  name: { order: 2, attributeName: 'cbc:Name', max: 1, classRef: UdtName },
  nameCode: { order: 3, attributeName: 'cbc:NameCode', max: 1, classRef: UdtCode },
  testMethod: { order: 4, attributeName: 'cbc:TestMethod', max: 1, classRef: UdtText },
  value: { order: 5, attributeName: 'cbc:Value', max: 1, classRef: UdtText },
  valueQuantity: { order: 6, attributeName: 'cbc:ValueQuantity', max: 1, classRef: UdtQuantity },
  valueQualifiers: { order: 7, attributeName: 'cbc:ValueQualifier', max: undefined, classRef: UdtText },
  importanceCode: { order: 8, attributeName: 'cbc:ImportanceCode', max: 1, classRef: UdtCode },
  listValues: { order: 9, attributeName: 'cbc:ListValue', max: undefined, classRef: UdtText },
  usabilityPeriod: { order: 10, attributeName: 'cac:UsabilityPeriod', max: 1, classRef: () => EstimatedDeliveryPeriod },
  itemPropertyGroups: {
    order: 11,
    attributeName: 'cac:ItemPropertyGroup',
    max: undefined,
    classRef: () => ItemPropertyGroup,
  },
  rangeDimension: { order: 12, attributeName: 'cac:RangeDimension', max: 1, classRef: () => RangeDimension },
  itemPropertyRange: { order: 13, attributeName: 'cac:ItemPropertyRange', max: 1, classRef: () => ItemPropertyRange },
};

type AllowedParams = {
  /** An identifier for this property of an item. */
  id?: string | UdtIdentifier;
  /** The name of this item property. */
  name: string | UdtName;
  /** The name of this item property, expressed as a code. */
  nameCode?: string | UdtCode;
  /** The method of testing the value of this item property. */
  testMethod?: string | UdtText;
  /** The value of this item property, expressed as text. */
  value?: string | UdtText;
  /** The value of this item property, expressed as a quantity. */
  valueQuantity?: string | UdtQuantity;
  /** Text qualifying the value of the property. */
  valueQualifiers?: (string | UdtText)[];
  /** A code signifying the importance of this property in using it to describe a related Item. */
  importanceCode?: string | UdtCode;
  /** The value expressed as a text in case the property is a value in a list. For example, a colour. */
  listValues?: (string | UdtText)[];
  /** The period during which this item property is valid. */
  usabilityPeriod?: EstimatedDeliveryPeriod;
  /** A description of the property group to which this item property belongs. */
  itemPropertyGroups?: ItemPropertyGroup[];
  /** The range of values for the dimensions of this property. */
  rangeDimension?: RangeDimension;
  /** A range of values for this item property. */
  itemPropertyRange?: ItemPropertyRange;
};

class ItemProperty extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ItemProperty');
  }
}

export {
  ItemProperty as AdditionalItemProperty,
  ItemProperty,
  AllowedParams as ItemPropertyParams,
  ItemProperty as KeywordItemProperty,
};
