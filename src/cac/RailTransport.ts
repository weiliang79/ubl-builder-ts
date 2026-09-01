import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier } from '../datatypes/udt';

/**
 * cac:RailTransportType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:RailTransportType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  trainID: { order: 1, attributeName: 'cbc:TrainID', max: 1, classRef: UdtIdentifier },
  railCarID: { order: 2, attributeName: 'cbc:RailCarID', max: 1, classRef: UdtIdentifier },
};

type AllowedParams = {
  /** An identifier for the train used as the means of transport. */
  trainID: string | UdtIdentifier;
  /** An identifier for the rail car on the train used as the means of transport. */
  railCarID?: string | UdtIdentifier;
};

class RailTransport extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:RailTransport');
  }
}

export { RailTransport, AllowedParams as RailTransportParams };
