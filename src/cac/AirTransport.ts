import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier } from '../datatypes/udt';

/**
 * cac:AirTransportType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:AirTransportType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  aircraftID: { order: 1, attributeName: 'cbc:AircraftID', max: 1, classRef: UdtIdentifier },
};

type AllowedParams = {
  /** An identifer for a specific aircraft. */
  aircraftID: string | UdtIdentifier;
};

class AirTransport extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:AirTransport');
  }
}

export { AirTransport, AllowedParams as AirTransportParams };
