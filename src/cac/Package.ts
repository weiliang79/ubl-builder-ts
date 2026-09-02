import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtIndicator, UdtQuantity, UdtText } from '../datatypes/udt';
import { Delivery } from './Delivery';
import { DeliveryUnit } from './DeliveryUnit';
import { Despatch } from './Despatch';
import { MeasurementDimension } from './Dimension';
import { GoodsItem } from './GoodsItem';
import { Pickup } from './Pickup';
import { ContainingTransportEquipment } from './TransportEquipment';

/**
 * cac:PackageType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:PackageType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  quantity: { order: 2, attributeName: 'cbc:Quantity', max: 1, classRef: UdtQuantity },
  returnableMaterialIndicator: {
    order: 3,
    attributeName: 'cbc:ReturnableMaterialIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  packageLevelCode: { order: 4, attributeName: 'cbc:PackageLevelCode', max: 1, classRef: UdtCode },
  packagingTypeCode: { order: 5, attributeName: 'cbc:PackagingTypeCode', max: 1, classRef: UdtCode },
  packingMaterials: { order: 6, attributeName: 'cbc:PackingMaterial', max: undefined, classRef: UdtText },
  traceID: { order: 7, attributeName: 'cbc:TraceID', max: 1, classRef: UdtIdentifier },
  containedPackages: { order: 8, attributeName: 'cac:ContainedPackage', max: undefined, classRef: () => Package },
  containingTransportEquipment: {
    order: 9,
    attributeName: 'cac:ContainingTransportEquipment',
    max: 1,
    classRef: () => ContainingTransportEquipment,
  },
  goodsItems: { order: 10, attributeName: 'cac:GoodsItem', max: undefined, classRef: () => GoodsItem },
  measurementDimensions: {
    order: 11,
    attributeName: 'cac:MeasurementDimension',
    max: undefined,
    classRef: () => MeasurementDimension,
  },
  deliveryUnits: { order: 12, attributeName: 'cac:DeliveryUnit', max: undefined, classRef: () => DeliveryUnit },
  delivery: { order: 13, attributeName: 'cac:Delivery', max: 1, classRef: () => Delivery },
  pickup: { order: 14, attributeName: 'cac:Pickup', max: 1, classRef: () => Pickup },
  despatch: { order: 15, attributeName: 'cac:Despatch', max: 1, classRef: () => Despatch },
};

type AllowedParams = {
  /** An identifier for this package. */
  id?: string | UdtIdentifier;
  /** The quantity of items contained in this package. */
  quantity?: string | UdtQuantity;
  /** An indicator that the packaging material is returnable (true) or not (false). */
  returnableMaterialIndicator?: string | UdtIndicator;
  /** A code signifying a level of packaging. */
  packageLevelCode?: string | UdtCode;
  /** A code signifying a type of packaging. */
  packagingTypeCode?: string | UdtCode;
  /** Text describing the packaging material. */
  packingMaterials?: (string | UdtText)[];
  /** An identifier for use in tracing this package, such as the EPC number used in RFID. */
  traceID?: string | UdtIdentifier;
  /** A package contained within this package. */
  containedPackages?: Package[];
  /** The piece of transport equipment containing this package. */
  containingTransportEquipment?: ContainingTransportEquipment;
  /** A goods item included in this package. */
  goodsItems?: GoodsItem[];
  /** A measurable dimension (length, mass, weight, or volume) of this package. */
  measurementDimensions?: MeasurementDimension[];
  /** A delivery unit within this package. */
  deliveryUnits?: DeliveryUnit[];
  /** The delivery of this package. */
  delivery?: Delivery;
  /** The pickup of this package. */
  pickup?: Pickup;
  /** The despatch of this package. */
  despatch?: Despatch;
};

class Package extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Package');
  }
}

export {
  Package as ActualPackage,
  Package as ContainedPackage,
  Package as ContainingPackage,
  Package,
  AllowedParams as PackageParams,
  Package as ReferencedPackage,
};
