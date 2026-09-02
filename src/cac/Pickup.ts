import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtDate, UdtIdentifier, UdtTime } from '../datatypes/udt';
import { AlternativeDeliveryLocation } from './Location';
import { Party } from './Party';

/**
 * cac:PickupType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:PickupType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  actualPickupDate: { order: 2, attributeName: 'cbc:ActualPickupDate', max: 1, classRef: UdtDate },
  actualPickupTime: { order: 3, attributeName: 'cbc:ActualPickupTime', max: 1, classRef: UdtTime },
  earliestPickupDate: { order: 4, attributeName: 'cbc:EarliestPickupDate', max: 1, classRef: UdtDate },
  earliestPickupTime: { order: 5, attributeName: 'cbc:EarliestPickupTime', max: 1, classRef: UdtTime },
  latestPickupDate: { order: 6, attributeName: 'cbc:LatestPickupDate', max: 1, classRef: UdtDate },
  latestPickupTime: { order: 7, attributeName: 'cbc:LatestPickupTime', max: 1, classRef: UdtTime },
  pickupLocation: {
    order: 8,
    attributeName: 'cac:PickupLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  pickupParty: { order: 9, attributeName: 'cac:PickupParty', max: 1, classRef: () => Party },
};

type AllowedParams = {
  /** An identifier for this pickup. */
  id?: string | UdtIdentifier;
  /** The actual pickup date. */
  actualPickupDate?: string | UdtDate;
  /** The actual pickup time. */
  actualPickupTime?: string | UdtTime;
  /** The earliest pickup date. */
  earliestPickupDate?: string | UdtDate;
  /** The earliest pickup time. */
  earliestPickupTime?: string | UdtTime;
  /** The latest pickup date. */
  latestPickupDate?: string | UdtDate;
  /** The latest pickup time. */
  latestPickupTime?: string | UdtTime;
  /** The pickup location. */
  pickupLocation?: AlternativeDeliveryLocation;
  /** The party responsible for picking up a delivery. */
  pickupParty?: Party;
};

class Pickup extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Pickup');
  }
}

export { Pickup, AllowedParams as PickupParams };
