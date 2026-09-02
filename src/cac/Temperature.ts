import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier, UdtMeasure, UdtText } from '../datatypes/udt';

/**
 * cac:TemperatureType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TemperatureType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  attributeID: { order: 1, attributeName: 'cbc:AttributeID', max: 1, classRef: UdtIdentifier },
  measure: { order: 2, attributeName: 'cbc:Measure', max: 1, classRef: UdtMeasure },
  descriptions: { order: 3, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
};

type AllowedParams = {
  /** An identifier for this temperature measurement. */
  attributeID: string | UdtIdentifier;
  /** The value of this temperature measurement. */
  measure: string | UdtMeasure;
  /** Text describing this temperature measurement. */
  descriptions?: (string | UdtText)[];
};

class Temperature extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Temperature');
  }
}

export {
  Temperature as AdditionalTemperature,
  Temperature as EmergencyTemperature,
  Temperature as FlashpointTemperature,
  Temperature as MaximumTemperature,
  Temperature as MinimumTemperature,
  Temperature,
  AllowedParams as TemperatureParams,
};
