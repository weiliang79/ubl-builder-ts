import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtQuantity, UdtText } from '../datatypes/udt';
import { DocumentReference } from './DocumentReference';
import { Item } from './Item';
import { OrderLineReference } from './OrderLineReference';
import { ShipmentType } from './Shipment';

/**
 * cac:DespatchLineType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:DespatchLineType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  uuid: { order: 2, attributeName: 'cbc:UUID', max: 1, classRef: UdtIdentifier },
  notes: { order: 3, attributeName: 'cbc:Note', max: undefined, classRef: UdtText },
  lineStatusCode: { order: 4, attributeName: 'cbc:LineStatusCode', max: 1, classRef: UdtCode },
  deliveredQuantity: { order: 5, attributeName: 'cbc:DeliveredQuantity', max: 1, classRef: UdtQuantity },
  backorderQuantity: { order: 6, attributeName: 'cbc:BackorderQuantity', max: 1, classRef: UdtQuantity },
  backorderReasons: { order: 7, attributeName: 'cbc:BackorderReason', max: undefined, classRef: UdtText },
  outstandingQuantity: { order: 8, attributeName: 'cbc:OutstandingQuantity', max: 1, classRef: UdtQuantity },
  outstandingReasons: { order: 9, attributeName: 'cbc:OutstandingReason', max: undefined, classRef: UdtText },
  oversupplyQuantity: { order: 10, attributeName: 'cbc:OversupplyQuantity', max: 1, classRef: UdtQuantity },
  orderLineReferences: {
    order: 11,
    attributeName: 'cac:OrderLineReference',
    max: undefined,
    classRef: () => OrderLineReference,
  },
  documentReferences: {
    order: 12,
    attributeName: 'cac:DocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  item: { order: 13, attributeName: 'cac:Item', max: 1, classRef: () => Item },
  shipments: { order: 14, attributeName: 'cac:Shipment', max: undefined, classRef: () => ShipmentType },
};

type AllowedParams = {
  /** An identifier for this despatch line. */
  id: string | UdtIdentifier;
  /** A universally unique identifier for this despatch line. */
  uuid?: string | UdtIdentifier;
  /** Free-form text conveying information that is not contained explicitly in other structures. */
  notes?: (string | UdtText)[];
  /** A code signifying the status of this despatch line with respect to its original state. */
  lineStatusCode?: string | UdtCode;
  /** The quantity despatched (picked up). */
  deliveredQuantity?: string | UdtQuantity;
  /** The quantity on back order at the supplier. */
  backorderQuantity?: string | UdtQuantity;
  /** The reason for the back order. */
  backorderReasons?: (string | UdtText)[];
  /** The quantity outstanding (which will follow in a later despatch). */
  outstandingQuantity?: string | UdtQuantity;
  /** The reason for the outstanding quantity. */
  outstandingReasons?: (string | UdtText)[];
  /** The quantity over-supplied, i.e., the quantity over and above that ordered. */
  oversupplyQuantity?: string | UdtQuantity;
  /** A reference to an order line associated with this despatch line. */
  orderLineReferences: OrderLineReference[];
  /** A reference to a document associated with this despatch line. */
  documentReferences?: DocumentReference[];
  /** The item associated with this despatch line. */
  item: Item;
  /** A shipment associated with this despatch line. */
  shipments?: ShipmentType[];
};

class DespatchLine extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:DespatchLine');
  }
}

export { DespatchLine, AllowedParams as DespatchLineParams, DespatchLine as HandlingUnitDespatchLine };
