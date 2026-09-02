import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtQuantity, UdtText } from '../datatypes/udt';
import { DocumentReference } from './DocumentReference';
import { Item } from './Item';
import { DespatchLineReference } from './LineReference';
import { OrderLineReference } from './OrderLineReference';
import { ShipmentType } from './Shipment';

/**
 * cac:ReceiptLineType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ReceiptLineType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  uuid: { order: 2, attributeName: 'cbc:UUID', max: 1, classRef: UdtIdentifier },
  notes: { order: 3, attributeName: 'cbc:Note', max: undefined, classRef: UdtText },
  receivedQuantity: { order: 4, attributeName: 'cbc:ReceivedQuantity', max: 1, classRef: UdtQuantity },
  shortQuantity: { order: 5, attributeName: 'cbc:ShortQuantity', max: 1, classRef: UdtQuantity },
  shortageActionCode: { order: 6, attributeName: 'cbc:ShortageActionCode', max: 1, classRef: UdtCode },
  rejectedQuantity: { order: 7, attributeName: 'cbc:RejectedQuantity', max: 1, classRef: UdtQuantity },
  rejectReasonCode: { order: 8, attributeName: 'cbc:RejectReasonCode', max: 1, classRef: UdtCode },
  rejectReasons: { order: 9, attributeName: 'cbc:RejectReason', max: undefined, classRef: UdtText },
  rejectActionCode: { order: 10, attributeName: 'cbc:RejectActionCode', max: 1, classRef: UdtCode },
  quantityDiscrepancyCode: { order: 11, attributeName: 'cbc:QuantityDiscrepancyCode', max: 1, classRef: UdtCode },
  oversupplyQuantity: { order: 12, attributeName: 'cbc:OversupplyQuantity', max: 1, classRef: UdtQuantity },
  receivedDate: { order: 13, attributeName: 'cbc:ReceivedDate', max: 1, classRef: UdtDate },
  timingComplaintCode: { order: 14, attributeName: 'cbc:TimingComplaintCode', max: 1, classRef: UdtCode },
  timingComplaint: { order: 15, attributeName: 'cbc:TimingComplaint', max: 1, classRef: UdtText },
  orderLineReference: {
    order: 16,
    attributeName: 'cac:OrderLineReference',
    max: 1,
    classRef: () => OrderLineReference,
  },
  despatchLineReferences: {
    order: 17,
    attributeName: 'cac:DespatchLineReference',
    max: undefined,
    classRef: () => DespatchLineReference,
  },
  documentReferences: {
    order: 18,
    attributeName: 'cac:DocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  items: { order: 19, attributeName: 'cac:Item', max: undefined, classRef: () => Item },
  shipments: { order: 20, attributeName: 'cac:Shipment', max: undefined, classRef: () => ShipmentType },
};

type AllowedParams = {
  /** An identifier for this receipt line. */
  id: string | UdtIdentifier;
  /** A universally unique identifier for this receipt line. */
  uuid?: string | UdtIdentifier;
  /** Free-form text conveying information that is not contained explicitly in other structures. */
  notes?: (string | UdtText)[];
  /** The quantity received. */
  receivedQuantity?: string | UdtQuantity;
  /** The quantity received short; the difference between the quantity reported despatched and the quantity actually received. */
  shortQuantity?: string | UdtQuantity;
  /** A code signifying the action that the delivery party wishes the despatch party to take as the result of a shortage. */
  shortageActionCode?: string | UdtCode;
  /** The quantity rejected. */
  rejectedQuantity?: string | UdtQuantity;
  /** The reason for a rejection, expressed as a code. */
  rejectReasonCode?: string | UdtCode;
  /** The reason for a rejection, expressed as text. */
  rejectReasons?: (string | UdtText)[];
  /** A code signifying the action that the delivery party wishes the despatch party to take as the result of a rejection. */
  rejectActionCode?: string | UdtCode;
  /** A code signifying the type of a discrepancy in quantity. */
  quantityDiscrepancyCode?: string | UdtCode;
  /** The quantity over-supplied, i.e., the quantity over and above the quantity ordered. */
  oversupplyQuantity?: string | UdtQuantity;
  /** The date on which the goods or services were received. */
  receivedDate?: string | UdtDate;
  /** A complaint about the timing of delivery, expressed as a code. */
  timingComplaintCode?: string | UdtCode;
  /** A complaint about the timing of delivery, expressed as text. */
  timingComplaint?: string | UdtText;
  /** A reference to the order line associated with this receipt line. */
  orderLineReference?: OrderLineReference;
  /** A reference to a despatch line associated with this receipt line. */
  despatchLineReferences?: DespatchLineReference[];
  /** A reference to a document associated with this receipt line. */
  documentReferences?: DocumentReference[];
  /** An item associated with this receipt line. */
  items?: Item[];
  /** A shipment associated with this receipt line. */
  shipments?: ShipmentType[];
};

class ReceiptLine extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ReceiptLine');
  }
}

export { ReceiptLine, AllowedParams as ReceiptLineParams, ReceiptLine as ReceivedHandlingUnitReceiptLine };
