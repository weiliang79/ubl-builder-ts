import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtText } from '../datatypes/udt';

/**
 * cac:PhysicalAttributeType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:PhysicalAttributeType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  attributeID: { order: 1, attributeName: 'cbc:AttributeID', max: 1, classRef: UdtIdentifier },
  positionCode: { order: 2, attributeName: 'cbc:PositionCode', max: 1, classRef: UdtCode },
  descriptionCode: { order: 3, attributeName: 'cbc:DescriptionCode', max: 1, classRef: UdtCode },
  descriptions: { order: 4, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
};

type AllowedParams = {
  /** An identifier for this physical attribute. */
  attributeID: string | UdtIdentifier;
  /** A code signifying the position of this physical attribute. */
  positionCode?: string | UdtCode;
  /** A description of the physical attribute, expressed as a code. */
  descriptionCode?: string | UdtCode;
  /** A description of the physical attribute, expressed as text. */
  descriptions?: (string | UdtText)[];
};

class PhysicalAttribute extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:PhysicalAttribute');
  }
}

export { PhysicalAttribute, AllowedParams as PhysicalAttributeParams };
