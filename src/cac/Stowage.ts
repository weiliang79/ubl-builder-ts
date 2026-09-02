import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier, UdtText } from '../datatypes/udt';
import { MeasurementDimension } from './Dimension';

/**
 * cac:StowageType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:StowageType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  locationID: { order: 1, attributeName: 'cbc:LocationID', max: 1, classRef: UdtIdentifier },
  locations: { order: 2, attributeName: 'cbc:Location', max: undefined, classRef: UdtText },
  measurementDimensions: {
    order: 3,
    attributeName: 'cac:MeasurementDimension',
    max: undefined,
    classRef: () => MeasurementDimension,
  },
};

type AllowedParams = {
  /** An identifier for the location. */
  locationID?: string | UdtIdentifier;
  /** Text describing the location. */
  locations?: (string | UdtText)[];
  /** A measurable dimension (length, mass, weight, or volume) of this stowage. */
  measurementDimensions?: MeasurementDimension[];
};

class Stowage extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Stowage');
  }
}

export { Stowage, AllowedParams as StowageParams };
