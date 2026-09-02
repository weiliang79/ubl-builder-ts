import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtName, UdtNumeric, UdtText, UdtTime } from '../datatypes/udt';
import { CommodityClassification } from './CommodityClassification';
import { TotalCapacityDimension } from './Dimension';
import { EnvironmentalEmission } from './EnvironmentalEmission';
import { Party } from './Party';
import { EstimatedDeliveryPeriod } from './Period';
import { ScheduledServiceFrequency } from './ServiceFrequency';
import { ShipmentStage } from './ShipmentStage';
import { SupportedTransportEquipment, TransportEquipment, UnsupportedTransportEquipment } from './TransportEquipment';
import { TransportEvent } from './TransportEvent';

/**
 * cac:TransportationServiceType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TransportationServiceType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  transportServiceCode: { order: 1, attributeName: 'cbc:TransportServiceCode', max: 1, classRef: UdtCode },
  tariffClassCode: { order: 2, attributeName: 'cbc:TariffClassCode', max: 1, classRef: UdtCode },
  priority: { order: 3, attributeName: 'cbc:Priority', max: 1, classRef: UdtText },
  freightRateClassCode: { order: 4, attributeName: 'cbc:FreightRateClassCode', max: 1, classRef: UdtCode },
  transportationServiceDescriptions: {
    order: 5,
    attributeName: 'cbc:TransportationServiceDescription',
    max: undefined,
    classRef: UdtText,
  },
  transportationServiceDetailsURI: {
    order: 6,
    attributeName: 'cbc:TransportationServiceDetailsURI',
    max: 1,
    classRef: UdtIdentifier,
  },
  nominationDate: { order: 7, attributeName: 'cbc:NominationDate', max: 1, classRef: UdtDate },
  nominationTime: { order: 8, attributeName: 'cbc:NominationTime', max: 1, classRef: UdtTime },
  name: { order: 9, attributeName: 'cbc:Name', max: 1, classRef: UdtName },
  sequenceNumeric: { order: 10, attributeName: 'cbc:SequenceNumeric', max: 1, classRef: UdtNumeric },
  transportEquipments: {
    order: 11,
    attributeName: 'cac:TransportEquipment',
    max: undefined,
    classRef: () => TransportEquipment,
  },
  supportedTransportEquipments: {
    order: 12,
    attributeName: 'cac:SupportedTransportEquipment',
    max: undefined,
    classRef: () => SupportedTransportEquipment,
  },
  unsupportedTransportEquipments: {
    order: 13,
    attributeName: 'cac:UnsupportedTransportEquipment',
    max: undefined,
    classRef: () => UnsupportedTransportEquipment,
  },
  commodityClassifications: {
    order: 14,
    attributeName: 'cac:CommodityClassification',
    max: undefined,
    classRef: () => CommodityClassification,
  },
  supportedCommodityClassifications: {
    order: 15,
    attributeName: 'cac:SupportedCommodityClassification',
    max: undefined,
    classRef: () => CommodityClassification,
  },
  unsupportedCommodityClassifications: {
    order: 16,
    attributeName: 'cac:UnsupportedCommodityClassification',
    max: undefined,
    classRef: () => CommodityClassification,
  },
  totalCapacityDimension: {
    order: 17,
    attributeName: 'cac:TotalCapacityDimension',
    max: 1,
    classRef: () => TotalCapacityDimension,
  },
  shipmentStages: { order: 18, attributeName: 'cac:ShipmentStage', max: undefined, classRef: () => ShipmentStage },
  transportEvents: { order: 19, attributeName: 'cac:TransportEvent', max: undefined, classRef: () => TransportEvent },
  responsibleTransportServiceProviderParty: {
    order: 20,
    attributeName: 'cac:ResponsibleTransportServiceProviderParty',
    max: 1,
    classRef: () => Party,
  },
  environmentalEmissions: {
    order: 21,
    attributeName: 'cac:EnvironmentalEmission',
    max: undefined,
    classRef: () => EnvironmentalEmission,
  },
  estimatedDurationPeriod: {
    order: 22,
    attributeName: 'cac:EstimatedDurationPeriod',
    max: 1,
    classRef: () => EstimatedDeliveryPeriod,
  },
  scheduledServiceFrequencies: {
    order: 23,
    attributeName: 'cac:ScheduledServiceFrequency',
    max: undefined,
    classRef: () => ScheduledServiceFrequency,
  },
};

type AllowedParams = {
  /** A code signifying the extent of this transportation service (e.g., door-to-door, port-to-port). */
  transportServiceCode: string | UdtCode;
  /** A code signifying the tariff class applicable to this transportation service. */
  tariffClassCode?: string | UdtCode;
  /** The priority of this transportation service. */
  priority?: string | UdtText;
  /** A code signifying the rate class for freight in this transportation service. */
  freightRateClassCode?: string | UdtCode;
  /** Text describing this transportation service. */
  transportationServiceDescriptions?: (string | UdtText)[];
  /** The Uniform Resource Identifier (URI) of a document providing additional details regarding this transportation service. */
  transportationServiceDetailsURI?: string | UdtIdentifier;
  /** In a transport contract, the deadline date by which this transportation service has to be booked. For example, if this service is scheduled for Wednesday 16 February 2011 at 10 a.m. CET, the nomination date might be Tuesday15 February 2011. */
  nominationDate?: string | UdtDate;
  /** In a transport contract, the deadline time by which this transportation service has to be booked. For example, if this service is scheduled for Wednesday 16 February 2011 at 10 a.m. CET, the nomination date might be Tuesday15 February 2011 and the nomination time 4 p.m. at the latest. */
  nominationTime?: string | UdtTime;
  /** The name of this transportation service. */
  name?: string | UdtName;
  /** A number indicating the order of this transportation service in a sequence of transportation services. */
  sequenceNumeric?: string | UdtNumeric;
  /** A piece of transport equipment used in this transportation service. */
  transportEquipments?: TransportEquipment[];
  /** A piece of transport equipment supported in this transportation service. */
  supportedTransportEquipments?: SupportedTransportEquipment[];
  /** A piece of transport equipment that is not supported in this transportation service. */
  unsupportedTransportEquipments?: UnsupportedTransportEquipment[];
  /** A classification of this transportation service. */
  commodityClassifications?: CommodityClassification[];
  /** A classification (e.g., general cargo) for commodities that can be handled in this transportation service. */
  supportedCommodityClassifications?: CommodityClassification[];
  /** A classification for commodities that cannot be handled in this transportation service. */
  unsupportedCommodityClassifications?: CommodityClassification[];
  /** The total capacity or volume available in this transportation service. */
  totalCapacityDimension?: TotalCapacityDimension;
  /** One of the stages of shipment in this transportation service. */
  shipmentStages?: ShipmentStage[];
  /** One of the transport events taking place in this transportation service. */
  transportEvents?: TransportEvent[];
  /** The transport service provider responsible for this transportation service. */
  responsibleTransportServiceProviderParty?: Party;
  /** An environmental emission resulting from this transportation service. */
  environmentalEmissions?: EnvironmentalEmission[];
  /** The estimated duration of this transportation service. */
  estimatedDurationPeriod?: EstimatedDeliveryPeriod;
  /** A class to specify which day of the week a transport service is operational. */
  scheduledServiceFrequencies?: ScheduledServiceFrequency[];
};

class TransportationService extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TransportationService');
  }
}

export {
  TransportationService as AdditionalTransportationService,
  TransportationService as FinalDeliveryTransportationService,
  TransportationService as MainTransportationService,
  TransportationService as OriginalDespatchTransportationService,
  TransportationService,
  AllowedParams as TransportationServiceParams,
};
