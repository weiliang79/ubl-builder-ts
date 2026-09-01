import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtIndicator, UdtQuantity, UdtText } from '../datatypes/udt';
import { CustomsDeclaration } from './CustomsDeclaration';
import { HandlingUnitDespatchLine } from './DespatchLine';
import { FloorSpaceMeasurementDimension, MeasurementDimension, PalletSpaceMeasurementDimension } from './Dimension';
import { DocumentReference } from './DocumentReference';
import { GoodsItem } from './GoodsItem';
import { HazardousGoodsTransit } from './HazardousGoodsTransit';
import { ActualPackage, Package } from './Package';
import { ReceivedHandlingUnitReceiptLine } from './ReceiptLine';
import { ShipmentType } from './Shipment';
import { Status } from './Status';
import { MaximumTemperature, MinimumTemperature } from './Temperature';
import { TransportEquipment } from './TransportEquipment';
import { TransportMeans } from './TransportMeans';

/**
 * cac:TransportHandlingUnitType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TransportHandlingUnitType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  transportHandlingUnitTypeCode: {
    order: 2,
    attributeName: 'cbc:TransportHandlingUnitTypeCode',
    max: 1,
    classRef: UdtCode,
  },
  handlingCode: { order: 3, attributeName: 'cbc:HandlingCode', max: 1, classRef: UdtCode },
  handlingInstructionses: { order: 4, attributeName: 'cbc:HandlingInstructions', max: undefined, classRef: UdtText },
  hazardousRiskIndicator: { order: 5, attributeName: 'cbc:HazardousRiskIndicator', max: 1, classRef: UdtIndicator },
  totalGoodsItemQuantity: { order: 6, attributeName: 'cbc:TotalGoodsItemQuantity', max: 1, classRef: UdtQuantity },
  totalPackageQuantity: { order: 7, attributeName: 'cbc:TotalPackageQuantity', max: 1, classRef: UdtQuantity },
  damageRemarkses: { order: 8, attributeName: 'cbc:DamageRemarks', max: undefined, classRef: UdtText },
  shippingMarkses: { order: 9, attributeName: 'cbc:ShippingMarks', max: undefined, classRef: UdtText },
  traceID: { order: 10, attributeName: 'cbc:TraceID', max: 1, classRef: UdtIdentifier },
  handlingUnitDespatchLines: {
    order: 11,
    attributeName: 'cac:HandlingUnitDespatchLine',
    max: undefined,
    classRef: () => HandlingUnitDespatchLine,
  },
  actualPackages: { order: 12, attributeName: 'cac:ActualPackage', max: undefined, classRef: () => ActualPackage },
  receivedHandlingUnitReceiptLines: {
    order: 13,
    attributeName: 'cac:ReceivedHandlingUnitReceiptLine',
    max: undefined,
    classRef: () => ReceivedHandlingUnitReceiptLine,
  },
  transportEquipments: {
    order: 14,
    attributeName: 'cac:TransportEquipment',
    max: undefined,
    classRef: () => TransportEquipment,
  },
  transportMeanses: { order: 15, attributeName: 'cac:TransportMeans', max: undefined, classRef: () => TransportMeans },
  hazardousGoodsTransits: {
    order: 16,
    attributeName: 'cac:HazardousGoodsTransit',
    max: undefined,
    classRef: () => HazardousGoodsTransit,
  },
  measurementDimensions: {
    order: 17,
    attributeName: 'cac:MeasurementDimension',
    max: undefined,
    classRef: () => MeasurementDimension,
  },
  minimumTemperature: {
    order: 18,
    attributeName: 'cac:MinimumTemperature',
    max: 1,
    classRef: () => MinimumTemperature,
  },
  maximumTemperature: {
    order: 19,
    attributeName: 'cac:MaximumTemperature',
    max: 1,
    classRef: () => MaximumTemperature,
  },
  goodsItems: { order: 20, attributeName: 'cac:GoodsItem', max: undefined, classRef: () => GoodsItem },
  floorSpaceMeasurementDimension: {
    order: 21,
    attributeName: 'cac:FloorSpaceMeasurementDimension',
    max: 1,
    classRef: () => FloorSpaceMeasurementDimension,
  },
  palletSpaceMeasurementDimension: {
    order: 22,
    attributeName: 'cac:PalletSpaceMeasurementDimension',
    max: 1,
    classRef: () => PalletSpaceMeasurementDimension,
  },
  shipmentDocumentReferences: {
    order: 23,
    attributeName: 'cac:ShipmentDocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  statuses: { order: 24, attributeName: 'cac:Status', max: undefined, classRef: () => Status },
  customsDeclarations: {
    order: 25,
    attributeName: 'cac:CustomsDeclaration',
    max: undefined,
    classRef: () => CustomsDeclaration,
  },
  referencedShipments: {
    order: 26,
    attributeName: 'cac:ReferencedShipment',
    max: undefined,
    classRef: () => ShipmentType,
  },
  packages: { order: 27, attributeName: 'cac:Package', max: undefined, classRef: () => Package },
};

type AllowedParams = {
  /** An identifier for this transport handling unit. */
  id?: string | UdtIdentifier;
  /** A code signifying the type of this transport handling unit. */
  transportHandlingUnitTypeCode?: string | UdtCode;
  /** The handling required for this transport handling unit, expressed as a code. */
  handlingCode?: string | UdtCode;
  /** The handling required for this transport handling unit, expressed as text. */
  handlingInstructionses?: (string | UdtText)[];
  /** An indicator that the materials contained in this transport handling unit are subject to an international regulation concerning the carriage of dangerous goods (true) or not (false). */
  hazardousRiskIndicator?: string | UdtIndicator;
  /** The total number of goods items in this transport handling unit. */
  totalGoodsItemQuantity?: string | UdtQuantity;
  /** The total number of packages in this transport handling unit. */
  totalPackageQuantity?: string | UdtQuantity;
  /** Text describing damage associated with this transport handling unit. */
  damageRemarkses?: (string | UdtText)[];
  /** Text describing the marks and numbers on this transport handling unit. */
  shippingMarkses?: (string | UdtText)[];
  /** An identifier for use in tracing this transport handling unit, such as the EPC number used in RFID. */
  traceID?: string | UdtIdentifier;
  /** A despatch line associated with this transport handling unit. */
  handlingUnitDespatchLines?: HandlingUnitDespatchLine[];
  /** A package contained in this transport handling unit. */
  actualPackages?: ActualPackage[];
  /** A receipt line associated with this transport handling unit. */
  receivedHandlingUnitReceiptLines?: ReceivedHandlingUnitReceiptLine[];
  /** A piece of transport equipment associated with this transport handling unit. */
  transportEquipments?: TransportEquipment[];
  /** A means of transport associated with this transport handling unit. */
  transportMeanses?: TransportMeans[];
  /** Transit-related information regarding a type of hazardous goods contained in this transport handling unit. */
  hazardousGoodsTransits?: HazardousGoodsTransit[];
  /** A measurable dimension (length, mass, weight, or volume) of this transport handling unit. */
  measurementDimensions?: MeasurementDimension[];
  /** The minimum required operating temperature of this transport handling unit. */
  minimumTemperature?: MinimumTemperature;
  /** The maximum allowable operating temperature of this transport handling unit. */
  maximumTemperature?: MaximumTemperature;
  /** A goods item contained in this transport handling unit. */
  goodsItems?: GoodsItem[];
  /** The floor space measurement dimension associated with this transport handling unit. */
  floorSpaceMeasurementDimension?: FloorSpaceMeasurementDimension;
  /** The pallet space measurement dimension associated to this transport handling unit. */
  palletSpaceMeasurementDimension?: PalletSpaceMeasurementDimension;
  /** A reference to a shipping document associated with this transport handling unit. */
  shipmentDocumentReferences?: DocumentReference[];
  /** The status of this transport handling unit. */
  statuses?: Status[];
  /** Describes identifiers or references relating to customs procedures. */
  customsDeclarations?: CustomsDeclaration[];
  /** A shipment associated with this transport handling unit. */
  referencedShipments?: ShipmentType[];
  /** A package contained in this transport handling unit. */
  packages?: Package[];
};

class TransportHandlingUnit extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TransportHandlingUnit');
  }
}

export {
  TransportHandlingUnit as PackagedTransportHandlingUnit,
  TransportHandlingUnit,
  AllowedParams as TransportHandlingUnitParams,
};
