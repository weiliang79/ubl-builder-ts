import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier } from '../datatypes/udt';

/**
 * cac:RoadTransportType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:RoadTransportType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  licensePlateID: { order: 1, attributeName: 'cbc:LicensePlateID', max: 1, classRef: UdtIdentifier },
};

type AllowedParams = {
  /** The license plate identifier of this vehicle. */
  licensePlateID: string | UdtIdentifier;
};

class RoadTransport extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:RoadTransport');
  }
}

export { RoadTransport, AllowedParams as RoadTransportParams };
