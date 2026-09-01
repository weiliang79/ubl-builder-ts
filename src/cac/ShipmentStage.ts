import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtIndicator, UdtQuantity, UdtText, UdtTime } from '../datatypes/udt';
import { AllowanceCharge } from './AllowanceCharge';
import { AlternativeDeliveryLocation } from './Location';
import { CarrierParty, Party } from './Party';
import { EstimatedDeliveryPeriod } from './Period';
import {
  CrewMemberPerson,
  DriverPerson,
  MasterPerson,
  PassengerPerson,
  ReportingPerson,
  SecurityOfficerPerson,
  ShipsSurgeonPerson,
} from './Person';
import {
  AcceptanceTransportEvent,
  ActualArrivalTransportEvent,
  ActualDepartureTransportEvent,
  ActualPickupTransportEvent,
  ActualWaypointTransportEvent,
  AvailabilityTransportEvent,
  DeliveryTransportEvent,
  DetentionTransportEvent,
  DischargeTransportEvent,
  DropoffTransportEvent,
  EstimatedArrivalTransportEvent,
  EstimatedDepartureTransportEvent,
  ExaminationTransportEvent,
  ExportationTransportEvent,
  LoadingTransportEvent,
  OptionalTakeoverTransportEvent,
  PlannedArrivalTransportEvent,
  PlannedDepartureTransportEvent,
  PlannedWaypointTransportEvent,
  ReceiptTransportEvent,
  RequestedArrivalTransportEvent,
  RequestedDepartureTransportEvent,
  RequestedWaypointTransportEvent,
  StorageTransportEvent,
  TakeoverTransportEvent,
  TransportEvent,
  WarehousingTransportEvent,
} from './TransportEvent';
import { TransportMeans } from './TransportMeans';

/**
 * cac:ShipmentStageType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ShipmentStageType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  transportModeCode: { order: 2, attributeName: 'cbc:TransportModeCode', max: 1, classRef: UdtCode },
  transportMeansTypeCode: { order: 3, attributeName: 'cbc:TransportMeansTypeCode', max: 1, classRef: UdtCode },
  transitDirectionCode: { order: 4, attributeName: 'cbc:TransitDirectionCode', max: 1, classRef: UdtCode },
  preCarriageIndicator: { order: 5, attributeName: 'cbc:PreCarriageIndicator', max: 1, classRef: UdtIndicator },
  onCarriageIndicator: { order: 6, attributeName: 'cbc:OnCarriageIndicator', max: 1, classRef: UdtIndicator },
  estimatedDeliveryDate: { order: 7, attributeName: 'cbc:EstimatedDeliveryDate', max: 1, classRef: UdtDate },
  estimatedDeliveryTime: { order: 8, attributeName: 'cbc:EstimatedDeliveryTime', max: 1, classRef: UdtTime },
  requiredDeliveryDate: { order: 9, attributeName: 'cbc:RequiredDeliveryDate', max: 1, classRef: UdtDate },
  requiredDeliveryTime: { order: 10, attributeName: 'cbc:RequiredDeliveryTime', max: 1, classRef: UdtTime },
  loadingSequenceID: { order: 11, attributeName: 'cbc:LoadingSequenceID', max: 1, classRef: UdtIdentifier },
  successiveSequenceID: { order: 12, attributeName: 'cbc:SuccessiveSequenceID', max: 1, classRef: UdtIdentifier },
  instructionses: { order: 13, attributeName: 'cbc:Instructions', max: undefined, classRef: UdtText },
  demurrageInstructionses: { order: 14, attributeName: 'cbc:DemurrageInstructions', max: undefined, classRef: UdtText },
  crewQuantity: { order: 15, attributeName: 'cbc:CrewQuantity', max: 1, classRef: UdtQuantity },
  passengerQuantity: { order: 16, attributeName: 'cbc:PassengerQuantity', max: 1, classRef: UdtQuantity },
  transitPeriod: { order: 17, attributeName: 'cac:TransitPeriod', max: 1, classRef: () => EstimatedDeliveryPeriod },
  carrierParties: { order: 18, attributeName: 'cac:CarrierParty', max: undefined, classRef: () => CarrierParty },
  transportMeans: { order: 19, attributeName: 'cac:TransportMeans', max: 1, classRef: () => TransportMeans },
  loadingPortLocation: {
    order: 20,
    attributeName: 'cac:LoadingPortLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  unloadingPortLocation: {
    order: 21,
    attributeName: 'cac:UnloadingPortLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  transshipPortLocation: {
    order: 22,
    attributeName: 'cac:TransshipPortLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  loadingTransportEvent: {
    order: 23,
    attributeName: 'cac:LoadingTransportEvent',
    max: 1,
    classRef: () => LoadingTransportEvent,
  },
  examinationTransportEvent: {
    order: 24,
    attributeName: 'cac:ExaminationTransportEvent',
    max: 1,
    classRef: () => ExaminationTransportEvent,
  },
  availabilityTransportEvent: {
    order: 25,
    attributeName: 'cac:AvailabilityTransportEvent',
    max: 1,
    classRef: () => AvailabilityTransportEvent,
  },
  exportationTransportEvent: {
    order: 26,
    attributeName: 'cac:ExportationTransportEvent',
    max: 1,
    classRef: () => ExportationTransportEvent,
  },
  dischargeTransportEvent: {
    order: 27,
    attributeName: 'cac:DischargeTransportEvent',
    max: 1,
    classRef: () => DischargeTransportEvent,
  },
  warehousingTransportEvent: {
    order: 28,
    attributeName: 'cac:WarehousingTransportEvent',
    max: 1,
    classRef: () => WarehousingTransportEvent,
  },
  takeoverTransportEvent: {
    order: 29,
    attributeName: 'cac:TakeoverTransportEvent',
    max: 1,
    classRef: () => TakeoverTransportEvent,
  },
  optionalTakeoverTransportEvent: {
    order: 30,
    attributeName: 'cac:OptionalTakeoverTransportEvent',
    max: 1,
    classRef: () => OptionalTakeoverTransportEvent,
  },
  dropoffTransportEvent: {
    order: 31,
    attributeName: 'cac:DropoffTransportEvent',
    max: 1,
    classRef: () => DropoffTransportEvent,
  },
  actualPickupTransportEvent: {
    order: 32,
    attributeName: 'cac:ActualPickupTransportEvent',
    max: 1,
    classRef: () => ActualPickupTransportEvent,
  },
  deliveryTransportEvent: {
    order: 33,
    attributeName: 'cac:DeliveryTransportEvent',
    max: 1,
    classRef: () => DeliveryTransportEvent,
  },
  receiptTransportEvent: {
    order: 34,
    attributeName: 'cac:ReceiptTransportEvent',
    max: 1,
    classRef: () => ReceiptTransportEvent,
  },
  storageTransportEvent: {
    order: 35,
    attributeName: 'cac:StorageTransportEvent',
    max: 1,
    classRef: () => StorageTransportEvent,
  },
  acceptanceTransportEvent: {
    order: 36,
    attributeName: 'cac:AcceptanceTransportEvent',
    max: 1,
    classRef: () => AcceptanceTransportEvent,
  },
  terminalOperatorParty: { order: 37, attributeName: 'cac:TerminalOperatorParty', max: 1, classRef: () => Party },
  customsAgentParty: { order: 38, attributeName: 'cac:CustomsAgentParty', max: 1, classRef: () => Party },
  estimatedTransitPeriod: {
    order: 39,
    attributeName: 'cac:EstimatedTransitPeriod',
    max: 1,
    classRef: () => EstimatedDeliveryPeriod,
  },
  freightAllowanceCharges: {
    order: 40,
    attributeName: 'cac:FreightAllowanceCharge',
    max: undefined,
    classRef: () => AllowanceCharge,
  },
  freightChargeLocation: {
    order: 41,
    attributeName: 'cac:FreightChargeLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  detentionTransportEvents: {
    order: 42,
    attributeName: 'cac:DetentionTransportEvent',
    max: undefined,
    classRef: () => DetentionTransportEvent,
  },
  requestedDepartureTransportEvent: {
    order: 43,
    attributeName: 'cac:RequestedDepartureTransportEvent',
    max: 1,
    classRef: () => RequestedDepartureTransportEvent,
  },
  requestedArrivalTransportEvent: {
    order: 44,
    attributeName: 'cac:RequestedArrivalTransportEvent',
    max: 1,
    classRef: () => RequestedArrivalTransportEvent,
  },
  requestedWaypointTransportEvents: {
    order: 45,
    attributeName: 'cac:RequestedWaypointTransportEvent',
    max: undefined,
    classRef: () => RequestedWaypointTransportEvent,
  },
  plannedDepartureTransportEvent: {
    order: 46,
    attributeName: 'cac:PlannedDepartureTransportEvent',
    max: 1,
    classRef: () => PlannedDepartureTransportEvent,
  },
  plannedArrivalTransportEvent: {
    order: 47,
    attributeName: 'cac:PlannedArrivalTransportEvent',
    max: 1,
    classRef: () => PlannedArrivalTransportEvent,
  },
  plannedWaypointTransportEvents: {
    order: 48,
    attributeName: 'cac:PlannedWaypointTransportEvent',
    max: undefined,
    classRef: () => PlannedWaypointTransportEvent,
  },
  actualDepartureTransportEvent: {
    order: 49,
    attributeName: 'cac:ActualDepartureTransportEvent',
    max: 1,
    classRef: () => ActualDepartureTransportEvent,
  },
  actualWaypointTransportEvent: {
    order: 50,
    attributeName: 'cac:ActualWaypointTransportEvent',
    max: 1,
    classRef: () => ActualWaypointTransportEvent,
  },
  actualArrivalTransportEvent: {
    order: 51,
    attributeName: 'cac:ActualArrivalTransportEvent',
    max: 1,
    classRef: () => ActualArrivalTransportEvent,
  },
  transportEvents: { order: 52, attributeName: 'cac:TransportEvent', max: undefined, classRef: () => TransportEvent },
  estimatedDepartureTransportEvent: {
    order: 53,
    attributeName: 'cac:EstimatedDepartureTransportEvent',
    max: 1,
    classRef: () => EstimatedDepartureTransportEvent,
  },
  estimatedArrivalTransportEvent: {
    order: 54,
    attributeName: 'cac:EstimatedArrivalTransportEvent',
    max: 1,
    classRef: () => EstimatedArrivalTransportEvent,
  },
  passengerPersons: {
    order: 55,
    attributeName: 'cac:PassengerPerson',
    max: undefined,
    classRef: () => PassengerPerson,
  },
  driverPersons: { order: 56, attributeName: 'cac:DriverPerson', max: undefined, classRef: () => DriverPerson },
  reportingPerson: { order: 57, attributeName: 'cac:ReportingPerson', max: 1, classRef: () => ReportingPerson },
  crewMemberPersons: {
    order: 58,
    attributeName: 'cac:CrewMemberPerson',
    max: undefined,
    classRef: () => CrewMemberPerson,
  },
  securityOfficerPerson: {
    order: 59,
    attributeName: 'cac:SecurityOfficerPerson',
    max: 1,
    classRef: () => SecurityOfficerPerson,
  },
  masterPerson: { order: 60, attributeName: 'cac:MasterPerson', max: 1, classRef: () => MasterPerson },
  shipsSurgeonPerson: {
    order: 61,
    attributeName: 'cac:ShipsSurgeonPerson',
    max: 1,
    classRef: () => ShipsSurgeonPerson,
  },
};

type AllowedParams = {
  /** An identifier for this shipment stage. */
  id?: string | UdtIdentifier;
  /** A code signifying the method of transport used for this shipment stage. */
  transportModeCode?: string | UdtCode;
  /** A code signifying the kind of transport means (truck, vessel, etc.) used for this shipment stage. */
  transportMeansTypeCode?: string | UdtCode;
  /** A code signifying the direction of transit in this shipment stage. */
  transitDirectionCode?: string | UdtCode;
  /** An indicator that this stage takes place before the main carriage of the shipment (true) or not (false). */
  preCarriageIndicator?: string | UdtIndicator;
  /** An indicator that this stage takes place after the main carriage of the shipment (true) or not (false). */
  onCarriageIndicator?: string | UdtIndicator;
  /** The estimated date of delivery in this shipment stage. */
  estimatedDeliveryDate?: string | UdtDate;
  /** The estimated time of delivery in this shipment stage. */
  estimatedDeliveryTime?: string | UdtTime;
  /** The delivery date required by the buyer in this shipment stage. */
  requiredDeliveryDate?: string | UdtDate;
  /** The delivery time required by the buyer in this shipment stage. */
  requiredDeliveryTime?: string | UdtTime;
  /** An identifier for the loading sequence (of consignments) associated with this shipment stage. */
  loadingSequenceID?: string | UdtIdentifier;
  /** Identifies the successive loading sequence (of consignments) associated with a shipment stage. */
  successiveSequenceID?: string | UdtIdentifier;
  /** Text of instructions applicable to a shipment stage. */
  instructionses?: (string | UdtText)[];
  /** Text of instructions relating to demurrage (the case in which a vessel is prevented from loading or discharging cargo within the stipulated laytime). */
  demurrageInstructionses?: (string | UdtText)[];
  /** The total number of crew aboard a transport means. */
  crewQuantity?: string | UdtQuantity;
  /** The total number of passengers aboard a transport means. */
  passengerQuantity?: string | UdtQuantity;
  /** The period during which this shipment stage actually took place. */
  transitPeriod?: EstimatedDeliveryPeriod;
  /** A carrier party responsible for this shipment stage. */
  carrierParties?: CarrierParty[];
  /** The means of transport used in this shipment stage. */
  transportMeans?: TransportMeans;
  /** The location of loading for a shipment stage. */
  loadingPortLocation?: AlternativeDeliveryLocation;
  /** The location of unloading for a shipment stage. */
  unloadingPortLocation?: AlternativeDeliveryLocation;
  /** The location of transshipment relating to a shipment stage. */
  transshipPortLocation?: AlternativeDeliveryLocation;
  /** The loading of goods in this shipment stage. */
  loadingTransportEvent?: LoadingTransportEvent;
  /** The examination of shipments in this shipment stage. */
  examinationTransportEvent?: ExaminationTransportEvent;
  /** The making available of shipments in this shipment stage. */
  availabilityTransportEvent?: AvailabilityTransportEvent;
  /** The export event associated with this shipment stage. */
  exportationTransportEvent?: ExportationTransportEvent;
  /** The discharge event associated with this shipment stage. */
  dischargeTransportEvent?: DischargeTransportEvent;
  /** The warehousing event associated with this shipment stage. */
  warehousingTransportEvent?: WarehousingTransportEvent;
  /** The receiver's takeover of the goods in this shipment stage. */
  takeoverTransportEvent?: TakeoverTransportEvent;
  /** The optional takeover of the goods in this shipment stage. */
  optionalTakeoverTransportEvent?: OptionalTakeoverTransportEvent;
  /** The dropping off of goods in this shipment stage. */
  dropoffTransportEvent?: DropoffTransportEvent;
  /** The pickup of goods in this shipment stage. */
  actualPickupTransportEvent?: ActualPickupTransportEvent;
  /** The delivery of goods in this shipment stage. */
  deliveryTransportEvent?: DeliveryTransportEvent;
  /** The receipt of goods in this shipment stage. */
  receiptTransportEvent?: ReceiptTransportEvent;
  /** The storage of goods in this shipment stage. */
  storageTransportEvent?: StorageTransportEvent;
  /** The acceptance of goods in this shipment stage. */
  acceptanceTransportEvent?: AcceptanceTransportEvent;
  /** A terminal operator associated with this shipment stage. */
  terminalOperatorParty?: Party;
  /** A customs agent associated with this shipment stage. */
  customsAgentParty?: Party;
  /** The estimated transit period of this shipment stage. */
  estimatedTransitPeriod?: EstimatedDeliveryPeriod;
  /** A freight allowance charge for this shipment stage. */
  freightAllowanceCharges?: AllowanceCharge[];
  /** The location associated with a freight charge related to this shipment stage. */
  freightChargeLocation?: AlternativeDeliveryLocation;
  /** The detention of a transport means during loading and unloading operations. */
  detentionTransportEvents?: DetentionTransportEvent[];
  /** The departure requested by the party requesting a transportation service. */
  requestedDepartureTransportEvent?: RequestedDepartureTransportEvent;
  /** The arrival requested by the party requesting a transportation service. */
  requestedArrivalTransportEvent?: RequestedArrivalTransportEvent;
  /** A waypoint requested by the party requesting a transportation service. */
  requestedWaypointTransportEvents?: RequestedWaypointTransportEvent[];
  /** The departure planned by the party providing a transportation service. */
  plannedDepartureTransportEvent?: PlannedDepartureTransportEvent;
  /** The arrival planned by the party providing a transportation service. */
  plannedArrivalTransportEvent?: PlannedArrivalTransportEvent;
  /** A waypoint planned by the party providing a transportation service. */
  plannedWaypointTransportEvents?: PlannedWaypointTransportEvent[];
  /** The actual departure from a specific location during a transportation service. */
  actualDepartureTransportEvent?: ActualDepartureTransportEvent;
  /** The location of an actual waypoint during a transportation service. */
  actualWaypointTransportEvent?: ActualWaypointTransportEvent;
  /** The actual arrival at a specific location during a transportation service. */
  actualArrivalTransportEvent?: ActualArrivalTransportEvent;
  /** A significant occurrence in the course of this shipment of goods. */
  transportEvents?: TransportEvent[];
  /** Describes an estimated departure at a location during a transport service. */
  estimatedDepartureTransportEvent?: EstimatedDepartureTransportEvent;
  /** Describes an estimated arrival at a location during a transport service. */
  estimatedArrivalTransportEvent?: EstimatedArrivalTransportEvent;
  /** A person who travels in a conveyance without participating in its operation. */
  passengerPersons?: PassengerPerson[];
  /** Describes a person responsible for driving the transport means. */
  driverPersons?: DriverPerson[];
  /** Describes a person being responsible for providing the required administrative reporting relating to a transport. */
  reportingPerson?: ReportingPerson;
  /** A person operating or serving aboard a transport means. */
  crewMemberPersons?: CrewMemberPerson[];
  /** The person on board the vessel, accountable to the master, designated by the company as responsible for the security of the ship, including implementation and maintenance of the ship security plan and for the liaison with the company security officer and the port facility security officers. */
  securityOfficerPerson?: SecurityOfficerPerson;
  /** The person responsible for the ship's safe and efficient operation, including cargo operations, navigation, crew management and for ensuring that the vessel complies with local and international laws, as well as company and flag state policies. */
  masterPerson?: MasterPerson;
  /** The person responsible for the health of the people aboard a ship at sea. */
  shipsSurgeonPerson?: ShipsSurgeonPerson;
};

class ShipmentStage extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ShipmentStage');
  }
}

export {
  ShipmentStage as MainCarriageShipmentStage,
  ShipmentStage as OnCarriageShipmentStage,
  ShipmentStage as PreCarriageShipmentStage,
  ShipmentStage,
  AllowedParams as ShipmentStageParams,
};
