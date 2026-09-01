import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtIndicator, UdtMeasure, UdtPercent, UdtText } from '../datatypes/udt';
import { AllowanceCharge } from './AllowanceCharge';
import { Delivery } from './Delivery';
import { Despatch } from './Despatch';
import { MeasurementDimension } from './Dimension';
import { DocumentReference } from './DocumentReference';
import { GoodsItem } from './GoodsItem';
import { HazardousGoodsTransit } from './HazardousGoodsTransit';
import { AlternativeDeliveryLocation } from './Location';
import { Package } from './Package';
import { Party } from './Party';
import { Pickup } from './Pickup';
import { AccountingSupplierParty } from './SupplierParty';
import { MaximumTemperature, MinimumTemperature } from './Temperature';
import { HaulageTradingTerms } from './TradingTerms';
import { TransportEquipmentSeal } from './TransportEquipmentSeal';
import {
  DeliveryTransportEvent,
  HandlingTransportEvent,
  LoadingTransportEvent,
  PickupTransportEvent,
  PositioningTransportEvent,
  QuarantineTransportEvent,
  TransportEvent,
} from './TransportEvent';
import { PackagedTransportHandlingUnit } from './TransportHandlingUnit';
import { ApplicableTransportMeans } from './TransportMeans';

/**
 * cac:TransportEquipmentType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TransportEquipmentType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  referencedConsignmentIDs: {
    order: 2,
    attributeName: 'cbc:ReferencedConsignmentID',
    max: undefined,
    classRef: UdtIdentifier,
  },
  transportEquipmentTypeCode: { order: 3, attributeName: 'cbc:TransportEquipmentTypeCode', max: 1, classRef: UdtCode },
  providerTypeCode: { order: 4, attributeName: 'cbc:ProviderTypeCode', max: 1, classRef: UdtCode },
  ownerTypeCode: { order: 5, attributeName: 'cbc:OwnerTypeCode', max: 1, classRef: UdtCode },
  sizeTypeCode: { order: 6, attributeName: 'cbc:SizeTypeCode', max: 1, classRef: UdtCode },
  dispositionCode: { order: 7, attributeName: 'cbc:DispositionCode', max: 1, classRef: UdtCode },
  fullnessIndicationCode: { order: 8, attributeName: 'cbc:FullnessIndicationCode', max: 1, classRef: UdtCode },
  refrigerationOnIndicator: { order: 9, attributeName: 'cbc:RefrigerationOnIndicator', max: 1, classRef: UdtIndicator },
  informations: { order: 10, attributeName: 'cbc:Information', max: undefined, classRef: UdtText },
  returnabilityIndicator: { order: 11, attributeName: 'cbc:ReturnabilityIndicator', max: 1, classRef: UdtIndicator },
  legalStatusIndicator: { order: 12, attributeName: 'cbc:LegalStatusIndicator', max: 1, classRef: UdtIndicator },
  airFlowPercent: { order: 13, attributeName: 'cbc:AirFlowPercent', max: 1, classRef: UdtPercent },
  humidityPercent: { order: 14, attributeName: 'cbc:HumidityPercent', max: 1, classRef: UdtPercent },
  animalFoodApprovedIndicator: {
    order: 15,
    attributeName: 'cbc:AnimalFoodApprovedIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  humanFoodApprovedIndicator: {
    order: 16,
    attributeName: 'cbc:HumanFoodApprovedIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  dangerousGoodsApprovedIndicator: {
    order: 17,
    attributeName: 'cbc:DangerousGoodsApprovedIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  refrigeratedIndicator: { order: 18, attributeName: 'cbc:RefrigeratedIndicator', max: 1, classRef: UdtIndicator },
  characteristics: { order: 19, attributeName: 'cbc:Characteristics', max: 1, classRef: UdtText },
  damageRemarkses: { order: 20, attributeName: 'cbc:DamageRemarks', max: undefined, classRef: UdtText },
  descriptions: { order: 21, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  specialTransportRequirementses: {
    order: 22,
    attributeName: 'cbc:SpecialTransportRequirements',
    max: undefined,
    classRef: UdtText,
  },
  grossWeightMeasure: { order: 23, attributeName: 'cbc:GrossWeightMeasure', max: 1, classRef: UdtMeasure },
  grossVolumeMeasure: { order: 24, attributeName: 'cbc:GrossVolumeMeasure', max: 1, classRef: UdtMeasure },
  tareWeightMeasure: { order: 25, attributeName: 'cbc:TareWeightMeasure', max: 1, classRef: UdtMeasure },
  trackingDeviceCode: { order: 26, attributeName: 'cbc:TrackingDeviceCode', max: 1, classRef: UdtCode },
  powerIndicator: { order: 27, attributeName: 'cbc:PowerIndicator', max: 1, classRef: UdtIndicator },
  traceID: { order: 28, attributeName: 'cbc:TraceID', max: 1, classRef: UdtIdentifier },
  measurementDimensions: {
    order: 29,
    attributeName: 'cac:MeasurementDimension',
    max: undefined,
    classRef: () => MeasurementDimension,
  },
  transportEquipmentSeals: {
    order: 30,
    attributeName: 'cac:TransportEquipmentSeal',
    max: undefined,
    classRef: () => TransportEquipmentSeal,
  },
  minimumTemperature: {
    order: 31,
    attributeName: 'cac:MinimumTemperature',
    max: 1,
    classRef: () => MinimumTemperature,
  },
  maximumTemperature: {
    order: 32,
    attributeName: 'cac:MaximumTemperature',
    max: 1,
    classRef: () => MaximumTemperature,
  },
  providerParty: { order: 33, attributeName: 'cac:ProviderParty', max: 1, classRef: () => Party },
  loadingProofParty: { order: 34, attributeName: 'cac:LoadingProofParty', max: 1, classRef: () => Party },
  supplierParty: { order: 35, attributeName: 'cac:SupplierParty', max: 1, classRef: () => AccountingSupplierParty },
  ownerParty: { order: 36, attributeName: 'cac:OwnerParty', max: 1, classRef: () => Party },
  operatingParty: { order: 37, attributeName: 'cac:OperatingParty', max: 1, classRef: () => Party },
  loadingLocation: {
    order: 38,
    attributeName: 'cac:LoadingLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  unloadingLocation: {
    order: 39,
    attributeName: 'cac:UnloadingLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  storageLocation: {
    order: 40,
    attributeName: 'cac:StorageLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  positioningTransportEvents: {
    order: 41,
    attributeName: 'cac:PositioningTransportEvent',
    max: undefined,
    classRef: () => PositioningTransportEvent,
  },
  quarantineTransportEvents: {
    order: 42,
    attributeName: 'cac:QuarantineTransportEvent',
    max: undefined,
    classRef: () => QuarantineTransportEvent,
  },
  deliveryTransportEvents: {
    order: 43,
    attributeName: 'cac:DeliveryTransportEvent',
    max: undefined,
    classRef: () => DeliveryTransportEvent,
  },
  pickupTransportEvents: {
    order: 44,
    attributeName: 'cac:PickupTransportEvent',
    max: undefined,
    classRef: () => PickupTransportEvent,
  },
  handlingTransportEvents: {
    order: 45,
    attributeName: 'cac:HandlingTransportEvent',
    max: undefined,
    classRef: () => HandlingTransportEvent,
  },
  loadingTransportEvents: {
    order: 46,
    attributeName: 'cac:LoadingTransportEvent',
    max: undefined,
    classRef: () => LoadingTransportEvent,
  },
  transportEvents: { order: 47, attributeName: 'cac:TransportEvent', max: undefined, classRef: () => TransportEvent },
  applicableTransportMeans: {
    order: 48,
    attributeName: 'cac:ApplicableTransportMeans',
    max: 1,
    classRef: () => ApplicableTransportMeans,
  },
  haulageTradingTermses: {
    order: 49,
    attributeName: 'cac:HaulageTradingTerms',
    max: undefined,
    classRef: () => HaulageTradingTerms,
  },
  hazardousGoodsTransits: {
    order: 50,
    attributeName: 'cac:HazardousGoodsTransit',
    max: undefined,
    classRef: () => HazardousGoodsTransit,
  },
  packagedTransportHandlingUnits: {
    order: 51,
    attributeName: 'cac:PackagedTransportHandlingUnit',
    max: undefined,
    classRef: () => PackagedTransportHandlingUnit,
  },
  serviceAllowanceCharges: {
    order: 52,
    attributeName: 'cac:ServiceAllowanceCharge',
    max: undefined,
    classRef: () => AllowanceCharge,
  },
  freightAllowanceCharges: {
    order: 53,
    attributeName: 'cac:FreightAllowanceCharge',
    max: undefined,
    classRef: () => AllowanceCharge,
  },
  attachedTransportEquipments: {
    order: 54,
    attributeName: 'cac:AttachedTransportEquipment',
    max: undefined,
    classRef: () => TransportEquipment,
  },
  delivery: { order: 55, attributeName: 'cac:Delivery', max: 1, classRef: () => Delivery },
  pickup: { order: 56, attributeName: 'cac:Pickup', max: 1, classRef: () => Pickup },
  despatch: { order: 57, attributeName: 'cac:Despatch', max: 1, classRef: () => Despatch },
  shipmentDocumentReferences: {
    order: 58,
    attributeName: 'cac:ShipmentDocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  containedInTransportEquipments: {
    order: 59,
    attributeName: 'cac:ContainedInTransportEquipment',
    max: undefined,
    classRef: () => TransportEquipment,
  },
  packages: { order: 60, attributeName: 'cac:Package', max: undefined, classRef: () => Package },
  goodsItems: { order: 61, attributeName: 'cac:GoodsItem', max: undefined, classRef: () => GoodsItem },
};

type AllowedParams = {
  /** An identifier for this piece of transport equipment. */
  id?: string | UdtIdentifier;
  /** An identifier for the consignment contained by this piece of transport equipment. */
  referencedConsignmentIDs?: (string | UdtIdentifier)[];
  /** A code signifying the type of this piece of transport equipment. */
  transportEquipmentTypeCode?: string | UdtCode;
  /** A code signifying the type of provider of this piece of transport equipment. */
  providerTypeCode?: string | UdtCode;
  /** A code signifying the type of owner of this piece of transport equipment. */
  ownerTypeCode?: string | UdtCode;
  /** A code signifying the size and type of this piece of piece of transport equipment. When the piece of transport equipment is a shipping container, it is recommended to use ContainerSizeTypeCode for validation. */
  sizeTypeCode?: string | UdtCode;
  /** A code signifying the current disposition of this piece of transport equipment. */
  dispositionCode?: string | UdtCode;
  /** A code signifying whether this piece of transport equipment is full, partially full, or empty. */
  fullnessIndicationCode?: string | UdtCode;
  /** An indicator that this piece of transport equipment's refrigeration is on (true) or off (false). */
  refrigerationOnIndicator?: string | UdtIndicator;
  /** Additional information about this piece of transport equipment. */
  informations?: (string | UdtText)[];
  /** An indicator that this piece of transport equipment is returnable (true) or not (false). */
  returnabilityIndicator?: string | UdtIndicator;
  /** An indication of the legal status of this piece of transport equipment with respect to the Container Convention Code. */
  legalStatusIndicator?: string | UdtIndicator;
  /** The percent of the airflow within this piece of transport equipment. */
  airFlowPercent?: string | UdtPercent;
  /** The percent humidity within this piece of transport equipment. */
  humidityPercent?: string | UdtPercent;
  /** An indicator that this piece of transport equipment is approved for animal food (true) or not (false). */
  animalFoodApprovedIndicator?: string | UdtIndicator;
  /** An indicator that this piece of transport equipment is approved for human food (true) or not (false). */
  humanFoodApprovedIndicator?: string | UdtIndicator;
  /** An indicator that this piece of transport equipment is approved for dangerous goods (true) or not (false). */
  dangerousGoodsApprovedIndicator?: string | UdtIndicator;
  /** An indicator that this piece of transport equipment is refrigerated (true) or not (false). */
  refrigeratedIndicator?: string | UdtIndicator;
  /** Characteristics of this piece of transport equipment. */
  characteristics?: string | UdtText;
  /** Damage associated with this piece of transport equipment. */
  damageRemarkses?: (string | UdtText)[];
  /** Text describing this piece of transport equipment. */
  descriptions?: (string | UdtText)[];
  /** Special transport requirements expressed as text. */
  specialTransportRequirementses?: (string | UdtText)[];
  /** The gross weight of this piece of transport equipment. */
  grossWeightMeasure?: string | UdtMeasure;
  /** The gross volume of this piece of transport equipment. */
  grossVolumeMeasure?: string | UdtMeasure;
  /** The weight of this piece of transport equipment when empty. */
  tareWeightMeasure?: string | UdtMeasure;
  /** A code signifying the tracking device for this piece of transport equipment. */
  trackingDeviceCode?: string | UdtCode;
  /** An indicator that this piece of transport equipment can supply power (true) or not (false). */
  powerIndicator?: string | UdtIndicator;
  /** An identifier for use in tracing this piece of transport equipment, such as the EPC number used in RFID. */
  traceID?: string | UdtIdentifier;
  /** A measurable dimension (length, mass, weight, or volume) of this piece of transport equipment. */
  measurementDimensions?: MeasurementDimension[];
  /** A seal securing the door of a piece of transport equipment. */
  transportEquipmentSeals?: TransportEquipmentSeal[];
  /** In the case of a refrigeration unit, the minimum allowable operating temperature for this container. */
  minimumTemperature?: MinimumTemperature;
  /** In the case of a refrigeration unit, the maximum allowable operating temperature for this container. */
  maximumTemperature?: MaximumTemperature;
  /** The party providing this piece of transport equipment. */
  providerParty?: Party;
  /** The authorized party responsible for certifying that the goods were loaded into this piece of transport equipment. */
  loadingProofParty?: Party;
  /** The party that supplies this piece of transport equipment. */
  supplierParty?: AccountingSupplierParty;
  /** The party that owns this piece of transport equipment. */
  ownerParty?: Party;
  /** The party that operates this piece of transport equipment. */
  operatingParty?: Party;
  /** The location where this piece of transport equipment is loaded. */
  loadingLocation?: AlternativeDeliveryLocation;
  /** The location where this piece of transport equipment is unloaded. */
  unloadingLocation?: AlternativeDeliveryLocation;
  /** The location where this piece of transport equipment is being stored. */
  storageLocation?: AlternativeDeliveryLocation;
  /** A positioning of this piece of transport equipment. */
  positioningTransportEvents?: PositioningTransportEvent[];
  /** A quarantine of this piece of transport equipment. */
  quarantineTransportEvents?: QuarantineTransportEvent[];
  /** A delivery of this piece of transport equipment. */
  deliveryTransportEvents?: DeliveryTransportEvent[];
  /** A pickup of this piece of transport equipment. */
  pickupTransportEvents?: PickupTransportEvent[];
  /** A handling of this piece of transport equipment. */
  handlingTransportEvents?: HandlingTransportEvent[];
  /** A loading of this piece of transport equipment. */
  loadingTransportEvents?: LoadingTransportEvent[];
  /** A transport event associated with this piece of transport equipment. */
  transportEvents?: TransportEvent[];
  /** The applicable transport means associated with this piece of transport equipment. */
  applicableTransportMeans?: ApplicableTransportMeans;
  /** A set of haulage trading terms associated with this piece of transport equipment. */
  haulageTradingTermses?: HaulageTradingTerms[];
  /** Transit-related information regarding a type of hazardous goods contained in this piece of transport equipment. */
  hazardousGoodsTransits?: HazardousGoodsTransit[];
  /** A packaged transport handling unit associated with this piece of transport equipment. */
  packagedTransportHandlingUnits?: PackagedTransportHandlingUnit[];
  /** A service allowance charge associated with this piece of transport equipment. */
  serviceAllowanceCharges?: AllowanceCharge[];
  /** A freight allowance charge associated with this piece of transport equipment. */
  freightAllowanceCharges?: AllowanceCharge[];
  /** A piece of transport equipment attached to this piece of transport equipment. */
  attachedTransportEquipments?: TransportEquipment[];
  /** The delivery of this piece of transport equipment. */
  delivery?: Delivery;
  /** The pickup of this piece of transport equipment. */
  pickup?: Pickup;
  /** The despatch of this piece of transport equipment. */
  despatch?: Despatch;
  /** A reference to a shipping document associated with this piece of transport equipment. */
  shipmentDocumentReferences?: DocumentReference[];
  /** A piece of transport equipment contained in this piece of transport equipment. */
  containedInTransportEquipments?: TransportEquipment[];
  /** A package contained in this piece of transport equipment. */
  packages?: Package[];
  /** A goods item contained in this piece of transport equipment. */
  goodsItems?: GoodsItem[];
};

class TransportEquipment extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TransportEquipment');
  }
}

export {
  TransportEquipment as AttachedTransportEquipment,
  TransportEquipment as ContainedInTransportEquipment,
  TransportEquipment as ContainingTransportEquipment,
  TransportEquipment as ReferencedTransportEquipment,
  TransportEquipment as SupportedTransportEquipment,
  TransportEquipment,
  AllowedParams as TransportEquipmentParams,
  TransportEquipment as UnsupportedTransportEquipment,
};
