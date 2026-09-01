import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier, UdtQuantity } from '../datatypes/udt';
import { TransportEquipment } from './TransportEquipment';

/**
 * cac:GoodsItemContainerType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:GoodsItemContainerType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  quantity: { order: 2, attributeName: 'cbc:Quantity', max: 1, classRef: UdtQuantity },
  transportEquipments: {
    order: 3,
    attributeName: 'cac:TransportEquipment',
    max: undefined,
    classRef: () => TransportEquipment,
  },
};

type AllowedParams = {
  /** An identifier for this goods item container. */
  id: string | UdtIdentifier;
  /** The number of goods items loaded into or onto one piece of transport equipment as a total consignment or part of a consignment. */
  quantity?: string | UdtQuantity;
  /** A piece of transport equipment used to contain a single goods item. */
  transportEquipments?: TransportEquipment[];
};

class GoodsItemContainer extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:GoodsItemContainer');
  }
}

export { GoodsItemContainer, AllowedParams as GoodsItemContainerParams };
