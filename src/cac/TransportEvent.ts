import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtIndicator, UdtText, UdtTime } from '../datatypes/udt';
import { Contact } from './Contact';
import { AlternativeDeliveryLocation } from './Location';
import { EstimatedDeliveryPeriod } from './Period';
import { ShipmentType } from './Shipment';
import { Signature } from './Signature';
import { CurrentStatus } from './Status';

/**
 * cac:TransportEventType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TransportEventType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  identificationID: { order: 1, attributeName: 'cbc:IdentificationID', max: 1, classRef: UdtIdentifier },
  occurrenceDate: { order: 2, attributeName: 'cbc:OccurrenceDate', max: 1, classRef: UdtDate },
  occurrenceTime: { order: 3, attributeName: 'cbc:OccurrenceTime', max: 1, classRef: UdtTime },
  transportEventTypeCode: { order: 4, attributeName: 'cbc:TransportEventTypeCode', max: 1, classRef: UdtCode },
  descriptions: { order: 5, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  completionIndicator: { order: 6, attributeName: 'cbc:CompletionIndicator', max: 1, classRef: UdtIndicator },
  reportedShipment: { order: 7, attributeName: 'cac:ReportedShipment', max: 1, classRef: () => ShipmentType },
  currentStatuses: { order: 8, attributeName: 'cac:CurrentStatus', max: undefined, classRef: () => CurrentStatus },
  contacts: { order: 9, attributeName: 'cac:Contact', max: undefined, classRef: () => Contact },
  location: { order: 10, attributeName: 'cac:Location', max: 1, classRef: () => AlternativeDeliveryLocation },
  signature: { order: 11, attributeName: 'cac:Signature', max: 1, classRef: () => Signature },
  periods: { order: 12, attributeName: 'cac:Period', max: undefined, classRef: () => EstimatedDeliveryPeriod },
};

type AllowedParams = {
  /** An identifier for this transport event within an agreed event identification scheme. */
  identificationID?: string | UdtIdentifier;
  /** The date of this transport event. */
  occurrenceDate?: string | UdtDate;
  /** The time of this transport event. */
  occurrenceTime?: string | UdtTime;
  /** A code signifying the type of this transport event. */
  transportEventTypeCode?: string | UdtCode;
  /** Text describing this transport event. */
  descriptions?: (string | UdtText)[];
  /** An indicator that this transport event has been completed (true) or not (false). */
  completionIndicator?: string | UdtIndicator;
  /** The shipment involved in this transport event. */
  reportedShipment?: ShipmentType;
  /** The current status of this transport event. */
  currentStatuses?: CurrentStatus[];
  /** A contact associated with this transport event. */
  contacts?: Contact[];
  /** The location associated with this transport event. */
  location?: AlternativeDeliveryLocation;
  /** A signature that can be used to sign for an entry or an exit at a transport location (e.g., port terminal). */
  signature?: Signature;
  /** A period of time associated with this transport event. */
  periods?: EstimatedDeliveryPeriod[];
};

class TransportEvent extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TransportEvent');
  }
}

export {
  TransportEvent as AcceptanceTransportEvent,
  TransportEvent as ActualArrivalTransportEvent,
  TransportEvent as ActualDepartureTransportEvent,
  TransportEvent as ActualPickupTransportEvent,
  TransportEvent as ActualWaypointTransportEvent,
  TransportEvent as AvailabilityTransportEvent,
  TransportEvent as DeliveryTransportEvent,
  TransportEvent as DetentionTransportEvent,
  TransportEvent as DischargeTransportEvent,
  TransportEvent as DropoffTransportEvent,
  TransportEvent as EstimatedArrivalTransportEvent,
  TransportEvent as EstimatedDepartureTransportEvent,
  TransportEvent as ExaminationTransportEvent,
  TransportEvent as ExportationTransportEvent,
  TransportEvent as HandlingTransportEvent,
  TransportEvent as LoadingTransportEvent,
  TransportEvent as OptionalTakeoverTransportEvent,
  TransportEvent as PickupTransportEvent,
  TransportEvent as PlannedArrivalTransportEvent,
  TransportEvent as PlannedDeliveryTransportEvent,
  TransportEvent as PlannedDepartureTransportEvent,
  TransportEvent as PlannedPickupTransportEvent,
  TransportEvent as PlannedWaypointTransportEvent,
  TransportEvent as PositioningTransportEvent,
  TransportEvent as QuarantineTransportEvent,
  TransportEvent as ReceiptTransportEvent,
  TransportEvent as RequestedArrivalTransportEvent,
  TransportEvent as RequestedDeliveryTransportEvent,
  TransportEvent as RequestedDepartureTransportEvent,
  TransportEvent as RequestedPickupTransportEvent,
  TransportEvent as RequestedWaypointTransportEvent,
  TransportEvent as StorageTransportEvent,
  TransportEvent as TakeoverTransportEvent,
  TransportEvent,
  AllowedParams as TransportEventParams,
  TransportEvent as UpdatedDeliveryTransportEvent,
  TransportEvent as UpdatedPickupTransportEvent,
  TransportEvent as WarehousingTransportEvent,
};
