import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtAmount, UdtCode, UdtIdentifier, UdtIndicator, UdtMeasure, UdtQuantity, UdtText } from '../datatypes/udt';
import { OriginAddress } from './Address';
import { AllowanceCharge } from './AllowanceCharge';
import { Delivery } from './Delivery';
import { Despatch } from './Despatch';
import { MeasurementDimension } from './Dimension';
import { DocumentReference } from './DocumentReference';
import { GoodsItemContainer } from './GoodsItemContainer';
import { InvoiceLine } from './InvoiceLine';
import { Item } from './Item';
import { ContainingPackage } from './Package';
import { Pickup } from './Pickup';
import { MaximumTemperature, MinimumTemperature, Temperature } from './Temperature';

/**
 * cac:GoodsItemType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:GoodsItemType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  sequenceNumberID: { order: 2, attributeName: 'cbc:SequenceNumberID', max: 1, classRef: UdtIdentifier },
  descriptions: { order: 3, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  hazardousRiskIndicator: { order: 4, attributeName: 'cbc:HazardousRiskIndicator', max: 1, classRef: UdtIndicator },
  declaredCustomsValueAmount: {
    order: 5,
    attributeName: 'cbc:DeclaredCustomsValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  declaredForCarriageValueAmount: {
    order: 6,
    attributeName: 'cbc:DeclaredForCarriageValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  declaredStatisticsValueAmount: {
    order: 7,
    attributeName: 'cbc:DeclaredStatisticsValueAmount',
    max: 1,
    classRef: UdtAmount,
  },
  freeOnBoardValueAmount: { order: 8, attributeName: 'cbc:FreeOnBoardValueAmount', max: 1, classRef: UdtAmount },
  insuranceValueAmount: { order: 9, attributeName: 'cbc:InsuranceValueAmount', max: 1, classRef: UdtAmount },
  valueAmount: { order: 10, attributeName: 'cbc:ValueAmount', max: 1, classRef: UdtAmount },
  grossWeightMeasure: { order: 11, attributeName: 'cbc:GrossWeightMeasure', max: 1, classRef: UdtMeasure },
  netWeightMeasure: { order: 12, attributeName: 'cbc:NetWeightMeasure', max: 1, classRef: UdtMeasure },
  netNetWeightMeasure: { order: 13, attributeName: 'cbc:NetNetWeightMeasure', max: 1, classRef: UdtMeasure },
  chargeableWeightMeasure: { order: 14, attributeName: 'cbc:ChargeableWeightMeasure', max: 1, classRef: UdtMeasure },
  grossVolumeMeasure: { order: 15, attributeName: 'cbc:GrossVolumeMeasure', max: 1, classRef: UdtMeasure },
  netVolumeMeasure: { order: 16, attributeName: 'cbc:NetVolumeMeasure', max: 1, classRef: UdtMeasure },
  quantity: { order: 17, attributeName: 'cbc:Quantity', max: 1, classRef: UdtQuantity },
  preferenceCriterionCode: { order: 18, attributeName: 'cbc:PreferenceCriterionCode', max: 1, classRef: UdtCode },
  requiredCustomsID: { order: 19, attributeName: 'cbc:RequiredCustomsID', max: 1, classRef: UdtIdentifier },
  customsStatusCode: { order: 20, attributeName: 'cbc:CustomsStatusCode', max: 1, classRef: UdtCode },
  customsTariffQuantity: { order: 21, attributeName: 'cbc:CustomsTariffQuantity', max: 1, classRef: UdtQuantity },
  customsImportClassifiedIndicator: {
    order: 22,
    attributeName: 'cbc:CustomsImportClassifiedIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  chargeableQuantity: { order: 23, attributeName: 'cbc:ChargeableQuantity', max: 1, classRef: UdtQuantity },
  returnableQuantity: { order: 24, attributeName: 'cbc:ReturnableQuantity', max: 1, classRef: UdtQuantity },
  traceID: { order: 25, attributeName: 'cbc:TraceID', max: 1, classRef: UdtIdentifier },
  items: { order: 26, attributeName: 'cac:Item', max: undefined, classRef: () => Item },
  goodsItemContainers: {
    order: 27,
    attributeName: 'cac:GoodsItemContainer',
    max: undefined,
    classRef: () => GoodsItemContainer,
  },
  freightAllowanceCharges: {
    order: 28,
    attributeName: 'cac:FreightAllowanceCharge',
    max: undefined,
    classRef: () => AllowanceCharge,
  },
  invoiceLines: { order: 29, attributeName: 'cac:InvoiceLine', max: undefined, classRef: () => InvoiceLine },
  temperatures: { order: 30, attributeName: 'cac:Temperature', max: undefined, classRef: () => Temperature },
  containedGoodsItems: {
    order: 31,
    attributeName: 'cac:ContainedGoodsItem',
    max: undefined,
    classRef: () => GoodsItem,
  },
  originAddress: { order: 32, attributeName: 'cac:OriginAddress', max: 1, classRef: () => OriginAddress },
  delivery: { order: 33, attributeName: 'cac:Delivery', max: 1, classRef: () => Delivery },
  pickup: { order: 34, attributeName: 'cac:Pickup', max: 1, classRef: () => Pickup },
  despatch: { order: 35, attributeName: 'cac:Despatch', max: 1, classRef: () => Despatch },
  measurementDimensions: {
    order: 36,
    attributeName: 'cac:MeasurementDimension',
    max: undefined,
    classRef: () => MeasurementDimension,
  },
  containingPackages: {
    order: 37,
    attributeName: 'cac:ContainingPackage',
    max: undefined,
    classRef: () => ContainingPackage,
  },
  shipmentDocumentReference: {
    order: 38,
    attributeName: 'cac:ShipmentDocumentReference',
    max: 1,
    classRef: () => DocumentReference,
  },
  minimumTemperature: {
    order: 39,
    attributeName: 'cac:MinimumTemperature',
    max: 1,
    classRef: () => MinimumTemperature,
  },
  maximumTemperature: {
    order: 40,
    attributeName: 'cac:MaximumTemperature',
    max: 1,
    classRef: () => MaximumTemperature,
  },
};

type AllowedParams = {
  /** An identifier for this goods item. */
  id?: string | UdtIdentifier;
  /** A sequence number differentiating a specific goods item within a consignment. */
  sequenceNumberID?: string | UdtIdentifier;
  /** Text describing this goods item to identify it for customs, statistical, or transport purposes. */
  descriptions?: (string | UdtText)[];
  /** An indication that the transported goods item is subject to an international regulation concerning the carriage of dangerous goods (true) or not (false). */
  hazardousRiskIndicator?: string | UdtIndicator;
  /** The total declared value for customs purposes of the goods item. */
  declaredCustomsValueAmount?: string | UdtAmount;
  /** The value of this goods item, declared by the shipper or his agent solely for the purpose of varying the carrier's level of liability from that provided in the contract of carriage, in case of loss or damage to goods or delayed delivery. */
  declaredForCarriageValueAmount?: string | UdtAmount;
  /** The total declared value of all the goods items in the same consignment with this goods item that have the same statistical heading. */
  declaredStatisticsValueAmount?: string | UdtAmount;
  /** The monetary amount that has to be or has been paid as calculated under the applicable trade delivery. */
  freeOnBoardValueAmount?: string | UdtAmount;
  /** The amount covered by insurance for this goods item. */
  insuranceValueAmount?: string | UdtAmount;
  /** The amount on which a duty, tax, or fee will be assessed. */
  valueAmount?: string | UdtAmount;
  /** The weight of this goods item, including packing and packaging but excluding the carrier's equipment. */
  grossWeightMeasure?: string | UdtMeasure;
  /** The weight of this goods item, excluding packing but including packaging that normally accompanies the goods. */
  netWeightMeasure?: string | UdtMeasure;
  /** The total weight of this goods item, excluding all packing and packaging. */
  netNetWeightMeasure?: string | UdtMeasure;
  /** The weight on which a charge is to be based. */
  chargeableWeightMeasure?: string | UdtMeasure;
  /** The volume of this goods item, normally calculated by multiplying its maximum length, width, and height. */
  grossVolumeMeasure?: string | UdtMeasure;
  /** The volume contained by a goods item, excluding the volume of any packaging material. */
  netVolumeMeasure?: string | UdtMeasure;
  /** The number of units making up this goods item. */
  quantity?: string | UdtQuantity;
  /** A code signifying the treatment preference for this goods item according to international trading agreements. */
  preferenceCriterionCode?: string | UdtCode;
  /** An identifier for a set of tariff codes required to specify a type of goods for customs, transport, statistical, or other regulatory purposes. */
  requiredCustomsID?: string | UdtIdentifier;
  /** A code assigned by customs to signify the status of this goods item. */
  customsStatusCode?: string | UdtCode;
  /** Quantity of the units in this goods item as required by customs for tariff, statistical, or fiscal purposes. */
  customsTariffQuantity?: string | UdtQuantity;
  /** An indicator that this goods item has been classified for import by customs (true) or not (false). */
  customsImportClassifiedIndicator?: string | UdtIndicator;
  /** The number of units in the goods item to which charges apply. */
  chargeableQuantity?: string | UdtQuantity;
  /** The number of units in the goods item that may be returned. */
  returnableQuantity?: string | UdtQuantity;
  /** An identifier for use in tracing this goods item, such as the EPC number used in RFID. */
  traceID?: string | UdtIdentifier;
  /** Product information relating to a goods item. */
  items?: Item[];
  /** The transporting of a goods item in a unit of transport equipment (e.g., container). */
  goodsItemContainers?: GoodsItemContainer[];
  /** A cost incurred by the shipper in moving goods, by whatever means, from one place to another under the terms of the contract of carriage. In addition to transport costs, this may include such elements as packing, documentation, loading, unloading, and insurance to the extent that they relate to the freight costs. */
  freightAllowanceCharges?: AllowanceCharge[];
  /** Information about an invoice line relating to this goods item. */
  invoiceLines?: InvoiceLine[];
  /** The temperature of the goods item. */
  temperatures?: Temperature[];
  /** A goods item contained in this goods item. */
  containedGoodsItems?: GoodsItem[];
  /** The region in which the goods have been produced or manufactured, according to criteria laid down for the purposes of application of the customs tariff, or of quantitative restrictions, or of any other measure related to trade. */
  originAddress?: OriginAddress;
  /** The delivery of this goods item. */
  delivery?: Delivery;
  /** The pickup of this goods item. */
  pickup?: Pickup;
  /** The despatch of this goods item. */
  despatch?: Despatch;
  /** A measurable dimension (length, mass, weight, or volume) of this goods item. */
  measurementDimensions?: MeasurementDimension[];
  /** A package containing this goods item. */
  containingPackages?: ContainingPackage[];
  /** A reference to a shipping document associated with this goods item. */
  shipmentDocumentReference?: DocumentReference;
  /** Information about minimum temperature. */
  minimumTemperature?: MinimumTemperature;
  /** Information about maximum temperature. */
  maximumTemperature?: MaximumTemperature;
};

class GoodsItem extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:GoodsItem');
  }
}

export {
  GoodsItem as ContainedGoodsItem,
  GoodsItem,
  AllowedParams as GoodsItemParams,
  GoodsItem as ReferencedGoodsItem,
};
