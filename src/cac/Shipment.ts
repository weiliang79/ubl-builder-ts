import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtIndicator, UdtMeasure, UdtQuantity, UdtText } from '../datatypes/udt';
import { UdtAmount } from '../datatypes/udt/UdtAmount';
import { OriginAddress, ReturnAddress } from './Address';
import { AllowanceCharge } from './AllowanceCharge';
import { Consignment } from './Consignment';
import { Country } from './Country';
import { Delivery } from './Delivery';
import { GoodsItem } from './GoodsItem';
import { AlternativeDeliveryLocation } from './Location';
import { ShipmentStage } from './ShipmentStage';
import { TransportHandlingUnit } from './TransportHandlingUnit';

/*

  1    cbc:ID [1..1]    An identifier for this shipment.
  2    cbc:ShippingPriorityLevelCode [0..1]    A code signifying the priority or level of service required for this shipment.
  3    cbc:HandlingCode [0..1]    The handling required for this shipment, expressed as a code.
  4    cbc:HandlingInstructions [0..*]    The handling required for this shipment, expressed as text.
  5    cbc:Information [0..*]    Free-form text pertinent to this shipment, conveying information that is not contained explicitly in other structures.
  6    cbc:GrossWeightMeasure [0..1]    The total gross weight of a shipment; the weight of the goods plus packaging plus transport equipment.
  7    cbc:NetWeightMeasure [0..1]    The net weight of this shipment, excluding packaging.
  8    cbc:NetNetWeightMeasure [0..1]    The total net weight of this shipment, excluding packaging and transport equipment.
  9    cbc:GrossVolumeMeasure [0..1]    The total volume of the goods in this shipment, including packaging.
  10    cbc:NetVolumeMeasure [0..1]    The total volume of the goods in this shipment, excluding packaging and transport equipment.
  11    cbc:TotalGoodsItemQuantity [0..1]    The total number of goods items in this shipment.
  12    cbc:TotalTransportHandlingUnitQuantity [0..1]    The number of pieces of transport handling equipment (pallets, boxes, cases, etc.) in this shipment.
  13    cbc:InsuranceValueAmount [0..1]    The amount covered by insurance for this shipment.
  14    cbc:DeclaredCustomsValueAmount [0..1]    The total declared value for customs purposes of those goods in this shipment that are subject to the same customs procedure and have the same tariff/statistical heading, country information, and duty regime.
  15    cbc:DeclaredForCarriageValueAmount [0..1]    The value of this shipment, declared by the shipper or his agent solely for the purpose of varying the carrier's level of liability from that provided in the contract of carriage, in case of loss or damage to goods or delayed delivery.
  16    cbc:DeclaredStatisticsValueAmount [0..1]    The value, declared for statistical purposes, of those goods in this shipment that have the same statistical heading.
  17    cbc:FreeOnBoardValueAmount [0..1]    The monetary amount that has to be or has been paid as calculated under the applicable trade delivery.
  18    cbc:SpecialInstructions [0..*]    Special instructions relating to this shipment.
  19    cbc:DeliveryInstructions [0..*]    Delivery instructions relating to this shipment.
  20    cbc:SplitConsignmentIndicator [0..1]    An indicator that the consignment has been split in transit (true) or not (false).
  21    cbc:ConsignmentQuantity [0..1]    The total number of consignments within this shipment.
  22    cac:Consignment [0..*]    A consignment covering this shipment.
  23    cac:GoodsItem [0..*]    A goods item included in this shipment.
  24    cac:ShipmentStage [0..*]    A stage in the transport movement of this shipment.
  25    cac:Delivery [0..1]    The delivery of this shipment.
  26    cac:TransportHandlingUnit [0..*]    A transport handling unit associated with this shipment.
  27    cac:ReturnAddress [0..1]    The address to which a shipment should be returned.
  28    cac:OriginAddress [0..1]    The region in which the goods have been produced or manufactured, according to criteria laid down for the purposes of application of the customs tariff, or of quantitative restrictions, or of any other measure related to trade.
  29    cac:FirstArrivalPortLocation [0..1]    The first arrival location of a shipment. This would be a port for sea, an airport for air, a terminal for rail, or a border post for land crossing.
  30    cac:LastExitPortLocation [0..1]    The final exporting location for a shipment. This would be a port for sea, an airport for air, a terminal for rail, or a border post for land crossing.
  31    cac:ExportCountry [0..1]    The country from which the goods were originally exported, without any commercial transaction taking place in intermediate countries.
  32    cac:FreightAllowanceCharge [0..*]    A cost incurred by the shipper in moving goods, by whatever means, from one place to another under the terms of the contract of carriage. In addition to transport costs, this may include such elements as packing, documentation, loading, unloading, and insurance to the extent that they relate to the freight costs.

*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  consignments: { order: 22, attributeName: 'cac:Consignment', max: undefined, classRef: () => Consignment },
  goodsItems: { order: 23, attributeName: 'cac:GoodsItem', max: undefined, classRef: () => GoodsItem },
  shipmentStages: { order: 24, attributeName: 'cac:ShipmentStage', max: undefined, classRef: () => ShipmentStage },
  transportHandlingUnits: {
    order: 26,
    attributeName: 'cac:TransportHandlingUnit',
    max: undefined,
    classRef: () => TransportHandlingUnit,
  },
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  shippingPriorityLevelCode: {
    order: 2,
    attributeName: 'cbc:ShippingPriorityLevelCode',
    max: 1,
    classRef: UdtCode,
  },
  handlingCode: { order: 3, attributeName: 'cbc:HandlingCode', max: 1, classRef: UdtCode },
  handlingInstructions: {
    order: 4,
    attributeName: 'cbc:HandlingInstructions',
    max: undefined,
    classRef: UdtText,
  },
  informations: { order: 5, attributeName: 'cbc:Information', max: undefined, classRef: UdtText },
  grossWeightMeasure: { order: 6, attributeName: 'cbc:GrossWeightMeasure', max: 1, classRef: UdtMeasure },
  netWeightMeasure: { order: 7, attributeName: 'cbc:NetWeightMeasure', max: 1, classRef: UdtMeasure },
  netNetWeightMeasure: { order: 8, attributeName: 'cbc:NetNetWeightMeasure', max: 1, classRef: UdtMeasure },
  grossVolumeMeasure: { order: 9, attributeName: 'cbc:GrossVolumeMeasure', max: 1, classRef: UdtMeasure },
  netVolumeMeasure: { order: 10, attributeName: 'cbc:NetVolumeMeasure', max: 1, classRef: UdtMeasure },
  totalGoodsItemQuantity: {
    order: 11,
    attributeName: 'cbc:TotalGoodsItemQuantity',
    max: 1,
    classRef: UdtQuantity,
  },
  TotalTransportHandlingUnitQuantity: {
    order: 12,
    attributeName: 'cbc:TotalTransportHandlingUnitQuantity',
    max: 1,
    classRef: UdtQuantity,
  },
  InsuranceValueAmount: { order: 13, attributeName: 'cbc:InsuranceValueAmount', max: 1, classRef: UdtAmount },
  DeclaredCustomsValueAmount: {
    order: 14,
    attributeName: 'cbc:DeclaredCustomsValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  DeclaredForCarriageValueAmount: {
    order: 15,
    attributeName: 'cbc:DeclaredForCarriageValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  DeclaredStatisticsValueAmount: {
    order: 16,
    attributeName: 'cbc:DeclaredStatisticsValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  FreeOnBoardValueAmount: {
    order: 17,
    attributeName: 'cbc:FreeOnBoardValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  SpecialInstructions: {
    order: 18,
    attributeName: 'cbc:SpecialInstructions',
    max: undefined,
    classRef: UdtText,
  },
  DeliveryInstructions: {
    order: 19,
    attributeName: 'cbc:DeliveryInstructions',
    max: undefined,
    classRef: UdtText,
  },
  SplitConsignmentIndicator: {
    order: 20,
    attributeName: 'cbc:SplitConsignmentIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  ConsignmentQuantity: { order: 21, attributeName: 'cbc:ConsignmentQuantity', max: 1, classRef: UdtQuantity },
  delivery: { order: 25, attributeName: 'cac:Delivery', max: 1, classRef: () => Delivery },
  returnAddress: { order: 27, attributeName: 'cac:ReturnAddress', max: 1, classRef: () => ReturnAddress },
  originAddress: { order: 28, attributeName: 'cac:OriginAddress', max: 1, classRef: () => OriginAddress },
  firstArrivalPortLocation: {
    order: 29,
    attributeName: 'cac:FirstArrivalPortLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  lastExitPortLocation: {
    order: 30,
    attributeName: 'cac:LastExitPortLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  exportCountry: { order: 31, attributeName: 'cac:ExportCountry', max: 1, classRef: () => Country },
  freightAllowanceCharges: {
    order: 32,
    attributeName: 'cac:FreightAllowanceCharge',
    max: undefined,
    classRef: () => AllowanceCharge,
  },
  //  ##################################  TODO CAC MISSING ################################################
  // 22    cac:Consignment [0..*]    A consignment covering this shipment.
  // 23    cac:GoodsItem [0..*]    A goods item included in this shipment.
  // 24    cac:ShipmentStage [0..*]    A stage in the transport movement of this shipment.
  // 25    cac:Delivery [0..1]    The delivery of this shipment.
  // 26    cac:TransportHandlingUnit [0..*]    A transport handling unit associated with this shipment.
  // 27    cac:ReturnAddress [0..1]    The address to which a shipment should be returned.
  // 28    cac:OriginAddress [0..1]    The region in which the goods have been produced or manufactured, according to criteria laid down for the purposes of application of the customs tariff, or of quantitative restrictions, or of any other measure related to trade.
  // 29    cac:FirstArrivalPortLocation [0..1]    The first arrival location of a shipment. This would be a port for sea, an airport for air, a terminal for rail, or a border post for land crossing.
  // 30    cac:LastExitPortLocation [0..1]    The final exporting location for a shipment. This would be a port for sea, an airport for air, a terminal for rail, or a border post for land crossing.
  // 31    cac:ExportCountry [0..1]    The country from which the goods were originally exported, without any commercial transaction taking place in intermediate countries.
  // 32    cac:FreightAllowanceCharge [0..*]    A cost incurred by the shipper in moving goods, by whatever means, from one place to another under the terms of the contract of carriage. In addition to transport costs, this may include such elements as packing, documentation, loading, unloading, and insurance to the extent that they relate to the freight costs.
};

type AllowedParams = {
  /** A consignment covering this shipment. */
  consignments?: Consignment[];
  /** A goods item included in this shipment. */
  goodsItems?: GoodsItem[];
  /** A stage in the transport movement of this shipment. */
  shipmentStages?: ShipmentStage[];
  /** A transport handling unit associated with this shipment. */
  transportHandlingUnits?: TransportHandlingUnit[];
  /** The delivery of this shipment. */
  delivery?: Delivery;
  /** The address to which a shipment should be returned. */
  returnAddress?: ReturnAddress;
  /** The region in which the goods have been produced or manufactured, according to criteria laid down for the purposes of application of the customs tariff, or of quantitative restrictions, or of any other measure related to trade. */
  originAddress?: OriginAddress;
  /** The first arrival location of a shipment. This would be a port for sea, an airport for air, a terminal for rail, or a border post for land crossing. */
  firstArrivalPortLocation?: AlternativeDeliveryLocation;
  /** The final exporting location for a shipment. This would be a port for sea, an airport for air, a terminal for rail, or a border post for land crossing. */
  lastExitPortLocation?: AlternativeDeliveryLocation;
  /** The country from which the goods were originally exported, without any commercial transaction taking place in intermediate countries. */
  exportCountry?: Country;
  /** A cost incurred by the shipper in moving goods, by whatever means, from one place to another under the terms of the contract of carriage. In addition to transport costs, this may include such elements as packing, documentation, loading, unloading, and insurance to the extent that they relate to the freight costs. */
  freightAllowanceCharges?: AllowanceCharge[];
  id: string | UdtIdentifier;
  shippingPriorityLevelCode?: string | UdtCode;
  handlingCode?: string | UdtCode;
  handlingInstructions?: (string | UdtText)[];
  informations?: (string | UdtText)[];
  grossWeightMeasure?: string | UdtMeasure;
  netWeightMeasure?: string | UdtMeasure;
  netNetWeightMeasure?: string | UdtMeasure;
  grossVolumeMeasure?: string | UdtMeasure;
  netVolumeMeasure?: string | UdtMeasure;
  totalGoodsItemQuantity?: string | UdtQuantity;
  TotalTransportHandlingUnitQuantity?: string | UdtQuantity;
  InsuranceValueAmount?: string | UdtAmount;
  DeclaredCustomsValueAmount?: string | UdtAmount;
  DeclaredForCarriageValueAmount?: string | UdtAmount;
  DeclaredStatisticsValueAmount?: string | UdtAmount;
  FreeOnBoardValueAmount?: string | UdtAmount;
  SpecialInstructions?: (string | UdtText)[];
  DeliveryInstructions?: (string | UdtText)[];
  SplitConsignmentIndicator?: string | UdtIndicator;
  ConsignmentQuantity?: string | UdtQuantity;
};

/**
 *
 */
class ShipmentType extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ShipmentType');
  }
}

export { ShipmentType, AllowedParams as ShipmentTypeParams };
