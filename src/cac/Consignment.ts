import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtAmount, UdtCode, UdtIdentifier, UdtIndicator, UdtMeasure, UdtQuantity, UdtText } from '../datatypes/udt';
import { AllowanceCharge } from './AllowanceCharge';
import { TransportContract } from './Contract';
import { Country } from './Country';
import { CustomsDeclaration } from './CustomsDeclaration';
import { DeliveryTerms } from './DeliveryTerms';
import { AlternativeDeliveryLocation } from './Location';
import { CarrierParty, NotifyParty, Party } from './Party';
import { PaymentTerms } from './PaymentTerms';
import { ShipmentType } from './Shipment';
import { MainCarriageShipmentStage, OnCarriageShipmentStage, PreCarriageShipmentStage } from './ShipmentStage';
import { Status } from './Status';
import { FinalDeliveryTransportationService, OriginalDespatchTransportationService } from './TransportationService';
import {
  PlannedDeliveryTransportEvent,
  PlannedPickupTransportEvent,
  RequestedDeliveryTransportEvent,
  RequestedPickupTransportEvent,
  TransportEvent,
} from './TransportEvent';
import { TransportHandlingUnit } from './TransportHandlingUnit';

/**
 * cac:ConsignmentType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ConsignmentType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  carrierAssignedID: { order: 2, attributeName: 'cbc:CarrierAssignedID', max: 1, classRef: UdtIdentifier },
  consigneeAssignedID: { order: 3, attributeName: 'cbc:ConsigneeAssignedID', max: 1, classRef: UdtIdentifier },
  consignorAssignedID: { order: 4, attributeName: 'cbc:ConsignorAssignedID', max: 1, classRef: UdtIdentifier },
  freightForwarderAssignedID: {
    order: 5,
    attributeName: 'cbc:FreightForwarderAssignedID',
    max: 1,
    classRef: UdtIdentifier,
  },
  brokerAssignedID: { order: 6, attributeName: 'cbc:BrokerAssignedID', max: 1, classRef: UdtIdentifier },
  contractedCarrierAssignedID: {
    order: 7,
    attributeName: 'cbc:ContractedCarrierAssignedID',
    max: 1,
    classRef: UdtIdentifier,
  },
  performingCarrierAssignedID: {
    order: 8,
    attributeName: 'cbc:PerformingCarrierAssignedID',
    max: 1,
    classRef: UdtIdentifier,
  },
  summaryDescriptions: { order: 9, attributeName: 'cbc:SummaryDescription', max: undefined, classRef: UdtText },
  totalInvoiceAmount: { order: 10, attributeName: 'cbc:TotalInvoiceAmount', max: 1, classRef: UdtAmount },
  declaredCustomsValueAmount: {
    order: 11,
    attributeName: 'cbc:DeclaredCustomsValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  tariffDescriptions: { order: 12, attributeName: 'cbc:TariffDescription', max: undefined, classRef: UdtText },
  tariffCode: { order: 13, attributeName: 'cbc:TariffCode', max: 1, classRef: UdtCode },
  insurancePremiumAmount: { order: 14, attributeName: 'cbc:InsurancePremiumAmount', max: 1, classRef: UdtAmount },
  grossWeightMeasure: { order: 15, attributeName: 'cbc:GrossWeightMeasure', max: 1, classRef: UdtMeasure },
  netWeightMeasure: { order: 16, attributeName: 'cbc:NetWeightMeasure', max: 1, classRef: UdtMeasure },
  netNetWeightMeasure: { order: 17, attributeName: 'cbc:NetNetWeightMeasure', max: 1, classRef: UdtMeasure },
  chargeableWeightMeasure: { order: 18, attributeName: 'cbc:ChargeableWeightMeasure', max: 1, classRef: UdtMeasure },
  grossVolumeMeasure: { order: 19, attributeName: 'cbc:GrossVolumeMeasure', max: 1, classRef: UdtMeasure },
  netVolumeMeasure: { order: 20, attributeName: 'cbc:NetVolumeMeasure', max: 1, classRef: UdtMeasure },
  loadingLengthMeasure: { order: 21, attributeName: 'cbc:LoadingLengthMeasure', max: 1, classRef: UdtMeasure },
  remarkses: { order: 22, attributeName: 'cbc:Remarks', max: undefined, classRef: UdtText },
  hazardousRiskIndicator: { order: 23, attributeName: 'cbc:HazardousRiskIndicator', max: 1, classRef: UdtIndicator },
  animalFoodIndicator: { order: 24, attributeName: 'cbc:AnimalFoodIndicator', max: 1, classRef: UdtIndicator },
  humanFoodIndicator: { order: 25, attributeName: 'cbc:HumanFoodIndicator', max: 1, classRef: UdtIndicator },
  livestockIndicator: { order: 26, attributeName: 'cbc:LivestockIndicator', max: 1, classRef: UdtIndicator },
  bulkCargoIndicator: { order: 27, attributeName: 'cbc:BulkCargoIndicator', max: 1, classRef: UdtIndicator },
  containerizedIndicator: { order: 28, attributeName: 'cbc:ContainerizedIndicator', max: 1, classRef: UdtIndicator },
  generalCargoIndicator: { order: 29, attributeName: 'cbc:GeneralCargoIndicator', max: 1, classRef: UdtIndicator },
  specialSecurityIndicator: {
    order: 30,
    attributeName: 'cbc:SpecialSecurityIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  thirdPartyPayerIndicator: {
    order: 31,
    attributeName: 'cbc:ThirdPartyPayerIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  carrierServiceInstructionses: {
    order: 32,
    attributeName: 'cbc:CarrierServiceInstructions',
    max: undefined,
    classRef: UdtText,
  },
  customsClearanceServiceInstructionses: {
    order: 33,
    attributeName: 'cbc:CustomsClearanceServiceInstructions',
    max: undefined,
    classRef: UdtText,
  },
  forwarderServiceInstructionses: {
    order: 34,
    attributeName: 'cbc:ForwarderServiceInstructions',
    max: undefined,
    classRef: UdtText,
  },
  specialServiceInstructionses: {
    order: 35,
    attributeName: 'cbc:SpecialServiceInstructions',
    max: undefined,
    classRef: UdtText,
  },
  sequenceID: { order: 36, attributeName: 'cbc:SequenceID', max: 1, classRef: UdtIdentifier },
  shippingPriorityLevelCode: { order: 37, attributeName: 'cbc:ShippingPriorityLevelCode', max: 1, classRef: UdtCode },
  handlingCode: { order: 38, attributeName: 'cbc:HandlingCode', max: 1, classRef: UdtCode },
  handlingInstructionses: { order: 39, attributeName: 'cbc:HandlingInstructions', max: undefined, classRef: UdtText },
  informations: { order: 40, attributeName: 'cbc:Information', max: undefined, classRef: UdtText },
  totalGoodsItemQuantity: { order: 41, attributeName: 'cbc:TotalGoodsItemQuantity', max: 1, classRef: UdtQuantity },
  totalTransportHandlingUnitQuantity: {
    order: 42,
    attributeName: 'cbc:TotalTransportHandlingUnitQuantity',
    max: 1,
    classRef: UdtQuantity,
  },
  insuranceValueAmount: { order: 43, attributeName: 'cbc:InsuranceValueAmount', max: 1, classRef: UdtAmount },
  declaredForCarriageValueAmount: {
    order: 44,
    attributeName: 'cbc:DeclaredForCarriageValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  declaredStatisticsValueAmount: {
    order: 45,
    attributeName: 'cbc:DeclaredStatisticsValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  freeOnBoardValueAmount: { order: 46, attributeName: 'cbc:FreeOnBoardValueAmount', max: 1, classRef: UdtAmount },
  specialInstructionses: { order: 47, attributeName: 'cbc:SpecialInstructions', max: undefined, classRef: UdtText },
  splitConsignmentIndicator: {
    order: 48,
    attributeName: 'cbc:SplitConsignmentIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  deliveryInstructionses: { order: 49, attributeName: 'cbc:DeliveryInstructions', max: undefined, classRef: UdtText },
  consignmentQuantity: { order: 50, attributeName: 'cbc:ConsignmentQuantity', max: 1, classRef: UdtQuantity },
  consolidatableIndicator: { order: 51, attributeName: 'cbc:ConsolidatableIndicator', max: 1, classRef: UdtIndicator },
  haulageInstructionses: { order: 52, attributeName: 'cbc:HaulageInstructions', max: undefined, classRef: UdtText },
  loadingSequenceID: { order: 53, attributeName: 'cbc:LoadingSequenceID', max: 1, classRef: UdtIdentifier },
  childConsignmentQuantity: { order: 54, attributeName: 'cbc:ChildConsignmentQuantity', max: 1, classRef: UdtQuantity },
  totalPackagesQuantity: { order: 55, attributeName: 'cbc:TotalPackagesQuantity', max: 1, classRef: UdtQuantity },
  consolidatedShipments: {
    order: 56,
    attributeName: 'cac:ConsolidatedShipment',
    max: undefined,
    classRef: () => ShipmentType,
  },
  customsDeclarations: {
    order: 57,
    attributeName: 'cac:CustomsDeclaration',
    max: undefined,
    classRef: () => CustomsDeclaration,
  },
  requestedPickupTransportEvent: {
    order: 58,
    attributeName: 'cac:RequestedPickupTransportEvent',
    max: 1,
    classRef: () => RequestedPickupTransportEvent,
  },
  requestedDeliveryTransportEvent: {
    order: 59,
    attributeName: 'cac:RequestedDeliveryTransportEvent',
    max: 1,
    classRef: () => RequestedDeliveryTransportEvent,
  },
  plannedPickupTransportEvent: {
    order: 60,
    attributeName: 'cac:PlannedPickupTransportEvent',
    max: 1,
    classRef: () => PlannedPickupTransportEvent,
  },
  plannedDeliveryTransportEvent: {
    order: 61,
    attributeName: 'cac:PlannedDeliveryTransportEvent',
    max: 1,
    classRef: () => PlannedDeliveryTransportEvent,
  },
  statuses: { order: 62, attributeName: 'cac:Status', max: undefined, classRef: () => Status },
  childConsignments: { order: 63, attributeName: 'cac:ChildConsignment', max: undefined, classRef: () => Consignment },
  consigneeParty: { order: 64, attributeName: 'cac:ConsigneeParty', max: 1, classRef: () => Party },
  exporterParty: { order: 65, attributeName: 'cac:ExporterParty', max: 1, classRef: () => Party },
  consignorParty: { order: 66, attributeName: 'cac:ConsignorParty', max: 1, classRef: () => Party },
  importerParty: { order: 67, attributeName: 'cac:ImporterParty', max: 1, classRef: () => Party },
  carrierParty: { order: 68, attributeName: 'cac:CarrierParty', max: 1, classRef: () => CarrierParty },
  freightForwarderParty: { order: 69, attributeName: 'cac:FreightForwarderParty', max: 1, classRef: () => Party },
  notifyParty: { order: 70, attributeName: 'cac:NotifyParty', max: 1, classRef: () => NotifyParty },
  originalDespatchParty: { order: 71, attributeName: 'cac:OriginalDespatchParty', max: 1, classRef: () => Party },
  finalDeliveryParty: { order: 72, attributeName: 'cac:FinalDeliveryParty', max: 1, classRef: () => Party },
  performingCarrierParty: { order: 73, attributeName: 'cac:PerformingCarrierParty', max: 1, classRef: () => Party },
  substituteCarrierParty: { order: 74, attributeName: 'cac:SubstituteCarrierParty', max: 1, classRef: () => Party },
  logisticsOperatorParty: { order: 75, attributeName: 'cac:LogisticsOperatorParty', max: 1, classRef: () => Party },
  transportAdvisorParty: { order: 76, attributeName: 'cac:TransportAdvisorParty', max: 1, classRef: () => Party },
  hazardousItemNotificationParty: {
    order: 77,
    attributeName: 'cac:HazardousItemNotificationParty',
    max: 1,
    classRef: () => Party,
  },
  insuranceParty: { order: 78, attributeName: 'cac:InsuranceParty', max: 1, classRef: () => Party },
  mortgageHolderParty: { order: 79, attributeName: 'cac:MortgageHolderParty', max: 1, classRef: () => Party },
  billOfLadingHolderParty: { order: 80, attributeName: 'cac:BillOfLadingHolderParty', max: 1, classRef: () => Party },
  originalDepartureCountry: {
    order: 81,
    attributeName: 'cac:OriginalDepartureCountry',
    max: 1,
    classRef: () => Country,
  },
  finalDestinationCountry: { order: 82, attributeName: 'cac:FinalDestinationCountry', max: 1, classRef: () => Country },
  transitCountries: { order: 83, attributeName: 'cac:TransitCountry', max: undefined, classRef: () => Country },
  transportContract: { order: 84, attributeName: 'cac:TransportContract', max: 1, classRef: () => TransportContract },
  transportEvents: { order: 85, attributeName: 'cac:TransportEvent', max: undefined, classRef: () => TransportEvent },
  originalDespatchTransportationService: {
    order: 86,
    attributeName: 'cac:OriginalDespatchTransportationService',
    max: 1,
    classRef: () => OriginalDespatchTransportationService,
  },
  finalDeliveryTransportationService: {
    order: 87,
    attributeName: 'cac:FinalDeliveryTransportationService',
    max: 1,
    classRef: () => FinalDeliveryTransportationService,
  },
  deliveryTerms: { order: 88, attributeName: 'cac:DeliveryTerms', max: 1, classRef: () => DeliveryTerms },
  paymentTerms: { order: 89, attributeName: 'cac:PaymentTerms', max: 1, classRef: () => PaymentTerms },
  collectPaymentTerms: { order: 90, attributeName: 'cac:CollectPaymentTerms', max: 1, classRef: () => PaymentTerms },
  disbursementPaymentTerms: {
    order: 91,
    attributeName: 'cac:DisbursementPaymentTerms',
    max: 1,
    classRef: () => PaymentTerms,
  },
  prepaidPaymentTerms: { order: 92, attributeName: 'cac:PrepaidPaymentTerms', max: 1, classRef: () => PaymentTerms },
  freightAllowanceCharges: {
    order: 93,
    attributeName: 'cac:FreightAllowanceCharge',
    max: undefined,
    classRef: () => AllowanceCharge,
  },
  extraAllowanceCharges: {
    order: 94,
    attributeName: 'cac:ExtraAllowanceCharge',
    max: undefined,
    classRef: () => AllowanceCharge,
  },
  mainCarriageShipmentStages: {
    order: 95,
    attributeName: 'cac:MainCarriageShipmentStage',
    max: undefined,
    classRef: () => MainCarriageShipmentStage,
  },
  preCarriageShipmentStages: {
    order: 96,
    attributeName: 'cac:PreCarriageShipmentStage',
    max: undefined,
    classRef: () => PreCarriageShipmentStage,
  },
  onCarriageShipmentStages: {
    order: 97,
    attributeName: 'cac:OnCarriageShipmentStage',
    max: undefined,
    classRef: () => OnCarriageShipmentStage,
  },
  transportHandlingUnits: {
    order: 98,
    attributeName: 'cac:TransportHandlingUnit',
    max: undefined,
    classRef: () => TransportHandlingUnit,
  },
  firstArrivalPortLocation: {
    order: 99,
    attributeName: 'cac:FirstArrivalPortLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  lastExitPortLocation: {
    order: 100,
    attributeName: 'cac:LastExitPortLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
};

type AllowedParams = {
  /** An identifier assigned to a collection of goods for both import and export. */
  id: string | UdtIdentifier;
  /** An identifier for this consignment, assigned by the carrier. */
  carrierAssignedID?: string | UdtIdentifier;
  /** An identifier for this consignment, assigned by the consignee. */
  consigneeAssignedID?: string | UdtIdentifier;
  /** An identifier for this consignment, assigned by the consignor. */
  consignorAssignedID?: string | UdtIdentifier;
  /** An identifier for this consignment, assigned by the freight forwarder. */
  freightForwarderAssignedID?: string | UdtIdentifier;
  /** An identifier for this consignment, assigned by the broker. */
  brokerAssignedID?: string | UdtIdentifier;
  /** An identifier for this consignment, assigned by the contracted carrier. */
  contractedCarrierAssignedID?: string | UdtIdentifier;
  /** An identifier for this consignment, assigned by the performing carrier. */
  performingCarrierAssignedID?: string | UdtIdentifier;
  /** A textual summary description of the consignment. */
  summaryDescriptions?: (string | UdtText)[];
  /** The total of all invoice amounts declared in this consignment. */
  totalInvoiceAmount?: string | UdtAmount;
  /** The total declared value for customs purposes of all the goods in this consignment, regardless of whether they are subject to the same customs procedure, tariff/statistical categorization, country information, or duty regime. */
  declaredCustomsValueAmount?: string | UdtAmount;
  /** Text describing the tariff applied to this consignment. */
  tariffDescriptions?: (string | UdtText)[];
  /** A code signifying the tariff applied to this consignment. */
  tariffCode?: string | UdtCode;
  /** The amount of the premium payable to an insurance company for insuring the goods contained in this consignment. */
  insurancePremiumAmount?: string | UdtAmount;
  /** The total declared weight of the goods in this consignment, including packaging but excluding the carrier's equipment. */
  grossWeightMeasure?: string | UdtMeasure;
  /** The total net weight of all the goods items referred to as one consignment. */
  netWeightMeasure?: string | UdtMeasure;
  /** The total net weight of the goods in this consignment, exclusive of packaging. */
  netNetWeightMeasure?: string | UdtMeasure;
  /** The weight upon which a charge is to be based. */
  chargeableWeightMeasure?: string | UdtMeasure;
  /** The total volume of the goods referred to as one consignment. */
  grossVolumeMeasure?: string | UdtMeasure;
  /** The total net volume of all goods items referred to as one consignment. */
  netVolumeMeasure?: string | UdtMeasure;
  /** The total length in a means of transport or a piece of transport equipment which, given the width and height of the transport means, will accommodate all of the consignments in a single consolidation. */
  loadingLengthMeasure?: string | UdtMeasure;
  /** Remarks concerning the complete consignment, to be printed on the transport document. */
  remarkses?: (string | UdtText)[];
  /** An indication that the transported goods in this consignment are subject to an international regulation concerning the carriage of dangerous goods (true) or not (false). */
  hazardousRiskIndicator?: string | UdtIndicator;
  /** An indication that the transported goods in this consignment are animal foodstuffs (true) or not (false). */
  animalFoodIndicator?: string | UdtIndicator;
  /** An indication that the transported goods in this consignment are for human consumption (true) or not (false). */
  humanFoodIndicator?: string | UdtIndicator;
  /** An indication that the transported goods are livestock (true) or not (false). */
  livestockIndicator?: string | UdtIndicator;
  /** An indication that the transported goods in this consignment are bulk cargoes (true) or not (false). */
  bulkCargoIndicator?: string | UdtIndicator;
  /** An indication that the transported goods in this consignment are containerized cargoes (true) or not (false). */
  containerizedIndicator?: string | UdtIndicator;
  /** An indication that the transported goods in this consignment are general cargoes (true) or not (false). */
  generalCargoIndicator?: string | UdtIndicator;
  /** An indication that the transported goods in this consignment require special security (true) or not (false). */
  specialSecurityIndicator?: string | UdtIndicator;
  /** An indication that this consignment will be paid for by a third party (true) or not (false). */
  thirdPartyPayerIndicator?: string | UdtIndicator;
  /** Service instructions to the carrier, expressed as text. */
  carrierServiceInstructionses?: (string | UdtText)[];
  /** Service instructions for customs clearance, expressed as text. */
  customsClearanceServiceInstructionses?: (string | UdtText)[];
  /** Service instructions for the forwarder, expressed as text. */
  forwarderServiceInstructionses?: (string | UdtText)[];
  /** Special service instructions, expressed as text. */
  specialServiceInstructionses?: (string | UdtText)[];
  /** A sequence identifier for this consignment. */
  sequenceID?: string | UdtIdentifier;
  /** A code signifying the priority or level of service required for this consignment. */
  shippingPriorityLevelCode?: string | UdtCode;
  /** The handling required for this consignment, expressed as a code. */
  handlingCode?: string | UdtCode;
  /** The handling required for this consignment, expressed as text. */
  handlingInstructionses?: (string | UdtText)[];
  /** Free-form text pertinent to this consignment, conveying information that is not contained explicitly in other structures. */
  informations?: (string | UdtText)[];
  /** The total number of goods items in this consignment. */
  totalGoodsItemQuantity?: string | UdtQuantity;
  /** The number of pieces of transport handling equipment (pallets, boxes, cases, etc.) in this consignment. */
  totalTransportHandlingUnitQuantity?: string | UdtQuantity;
  /** The amount covered by insurance for this consignment. */
  insuranceValueAmount?: string | UdtAmount;
  /** The value of this consignment, declared by the shipper or his agent solely for the purpose of varying the carrier's level of liability from that provided in the contract of carriage, in case of loss or damage to goods or delayed delivery. */
  declaredForCarriageValueAmount?: string | UdtAmount;
  /** The value, declared for statistical purposes, of those goods in this consignment that have the same statistical heading. */
  declaredStatisticsValueAmount?: string | UdtAmount;
  /** The monetary amount that has to be or has been paid as calculated under the applicable trade delivery. */
  freeOnBoardValueAmount?: string | UdtAmount;
  /** Special instructions relating to this consignment. */
  specialInstructionses?: (string | UdtText)[];
  /** An indicator that this consignment has been split in transit (true) or not (false). */
  splitConsignmentIndicator?: string | UdtIndicator;
  /** A set of delivery instructions relating to this consignment. */
  deliveryInstructionses?: (string | UdtText)[];
  /** The count in this consignment considering goods items, child consignments, shipments */
  consignmentQuantity?: string | UdtQuantity;
  /** An indicator that this consignment can be consolidated (true) or not (false). */
  consolidatableIndicator?: string | UdtIndicator;
  /** Instructions regarding haulage of this consignment, expressed as text. */
  haulageInstructionses?: (string | UdtText)[];
  /** An identifier for the loading sequence of this consignment. */
  loadingSequenceID?: string | UdtIdentifier;
  /** The quantity of (consolidated) child consignments */
  childConsignmentQuantity?: string | UdtQuantity;
  /** The total number of packages associated with a Consignment. */
  totalPackagesQuantity?: string | UdtQuantity;
  /** A consolidated shipment (a shipment created by an act of consolidation). */
  consolidatedShipments?: ShipmentType[];
  /** A class describing identifiers or references relating to customs procedures. */
  customsDeclarations?: CustomsDeclaration[];
  /** The pickup of this consignment requested by the party requesting a transportation service (the transport user). */
  requestedPickupTransportEvent?: RequestedPickupTransportEvent;
  /** The delivery of this consignment requested by the party requesting a transportation service (the transport user). */
  requestedDeliveryTransportEvent?: RequestedDeliveryTransportEvent;
  /** The pickup of this consignment planned by the party responsible for providing the transportation service (the transport service provider). */
  plannedPickupTransportEvent?: PlannedPickupTransportEvent;
  /** The delivery of this consignment planned by the party responsible for providing the transportation service (the transport service provider). */
  plannedDeliveryTransportEvent?: PlannedDeliveryTransportEvent;
  /** The status of a particular condition associated with this consignment. */
  statuses?: Status[];
  /** One of the child consignments of which a consolidated consignment is composed. */
  childConsignments?: Consignment[];
  /** A party to which goods are consigned. */
  consigneeParty?: Party;
  /** The party that makes the export declaration, or on behalf of which the export declaration is made, and that is the owner of the goods in this consignment or has similar right of disposal over them at the time when the declaration is accepted. */
  exporterParty?: Party;
  /** The party consigning goods, as stipulated in the transport contract by the party ordering transport. */
  consignorParty?: Party;
  /** The party that makes an import declaration regarding this consignment, or on behalf of which a customs clearing agent or other authorized person makes an import declaration regarding this consignment. This may include a person who has possession of the goods or to whom the goods are consigned. */
  importerParty?: Party;
  /** The party providing the transport of goods in this consignment between named points. */
  carrierParty?: CarrierParty;
  /** The party combining individual smaller consignments into a single larger shipment (the consolidated shipment), which is sent to a counterpart that mirrors the consolidator's activity by dividing the consolidated consignment into its original components. */
  freightForwarderParty?: Party;
  /** The party to be notified upon arrival of goods and when special occurrences (usually pre-defined) take place during a transportation service. */
  notifyParty?: NotifyParty;
  /** The original despatch (sender) party for this consignment. */
  originalDespatchParty?: Party;
  /** The final delivery party for this consignment. */
  finalDeliveryParty?: Party;
  /** The party performing the carriage of this consignment. */
  performingCarrierParty?: Party;
  /** A substitute party performing the carriage of this consignment. */
  substituteCarrierParty?: Party;
  /** The logistics operator party for this consignment. */
  logisticsOperatorParty?: Party;
  /** The party providing transport advice this consignment. */
  transportAdvisorParty?: Party;
  /** The party that would be notified of a hazardous item in this consignment. */
  hazardousItemNotificationParty?: Party;
  /** The party holding the insurance for this consignment. */
  insuranceParty?: Party;
  /** The party holding the mortgage for this consignment. */
  mortgageHolderParty?: Party;
  /** The party holding the bill of lading for this consignment. */
  billOfLadingHolderParty?: Party;
  /** The country from which the goods in this consignment were originally exported, without any commercial transaction taking place in intermediate countries. */
  originalDepartureCountry?: Country;
  /** The country in which the goods in this consignment are to be delivered to the final consignee or buyer. */
  finalDestinationCountry?: Country;
  /** One of the countries through which goods or passengers in this consignment are routed between the country of original departure and the country of final destination. */
  transitCountries?: Country[];
  /** A transport contract relating to this consignment. */
  transportContract?: TransportContract;
  /** A class describing a significant occurrence or happening related to the transportation of goods. */
  transportEvents?: TransportEvent[];
  /** The service for pickup from the consignor under the transport contract for this consignment. */
  originalDespatchTransportationService?: OriginalDespatchTransportationService;
  /** The service for delivery to the consignee under the transport contract for this consignment. */
  finalDeliveryTransportationService?: FinalDeliveryTransportationService;
  /** The conditions agreed upon between a seller and a buyer with regard to the delivery of goods and/or services (e.g., CIF, FOB, or EXW from the INCOTERMS Terms of Delivery). */
  deliveryTerms?: DeliveryTerms;
  /** The terms of payment between the parties (such as logistics service client, logistics service provider) in a transaction. */
  paymentTerms?: PaymentTerms;
  /** The terms of payment that apply to the collection of this consignment. */
  collectPaymentTerms?: PaymentTerms;
  /** The terms of payment for disbursement. */
  disbursementPaymentTerms?: PaymentTerms;
  /** The terms of payment for prepayment. */
  prepaidPaymentTerms?: PaymentTerms;
  /** A cost incurred by the shipper in moving goods, by whatever means, from one place to another under the terms of the contract of carriage for this consignment. In addition to transport costs, this may include such elements as packing, documentation, loading, unloading, and insurance to the extent that they relate to the freight costs. */
  freightAllowanceCharges?: AllowanceCharge[];
  /** A charge for extra allowance. */
  extraAllowanceCharges?: AllowanceCharge[];
  /** A shipment stage during main carriage. */
  mainCarriageShipmentStages?: MainCarriageShipmentStage[];
  /** A shipment stage during precarriage (usually refers to movement activity that takes place prior to the container being loaded at a port of loading). */
  preCarriageShipmentStages?: PreCarriageShipmentStage[];
  /** A shipment stage during on-carriage (usually refers to movement activity that takes place after the container is discharged at a port of discharge). */
  onCarriageShipmentStages?: OnCarriageShipmentStage[];
  /** A transport handling unit used for loose and containerized goods. */
  transportHandlingUnits?: TransportHandlingUnit[];
  /** The first arrival location in a transport. This would be a port for sea, an airport for air, a terminal for rail, or a border post for land crossing. */
  firstArrivalPortLocation?: AlternativeDeliveryLocation;
  /** The final exporting location in a transport. This would be a port for sea, an airport for air, a terminal for rail, or a border post for land crossing. */
  lastExitPortLocation?: AlternativeDeliveryLocation;
};

class Consignment extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Consignment');
  }
}

export {
  Consignment as ChildConsignment,
  Consignment,
  AllowedParams as ConsignmentParams,
  Consignment as ReferencedConsignment,
};
