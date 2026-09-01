import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtDate, UdtIdentifier, UdtTime } from '../datatypes/udt';
import { AdditionalItemProperty } from './ItemProperty';
import { LotIdentification } from './LotIdentification';

/**
 * cac:ItemInstanceType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ItemInstanceType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  productTraceID: { order: 1, attributeName: 'cbc:ProductTraceID', max: 1, classRef: UdtIdentifier },
  manufactureDate: { order: 2, attributeName: 'cbc:ManufactureDate', max: 1, classRef: UdtDate },
  manufactureTime: { order: 3, attributeName: 'cbc:ManufactureTime', max: 1, classRef: UdtTime },
  bestBeforeDate: { order: 4, attributeName: 'cbc:BestBeforeDate', max: 1, classRef: UdtDate },
  registrationID: { order: 5, attributeName: 'cbc:RegistrationID', max: 1, classRef: UdtIdentifier },
  serialID: { order: 6, attributeName: 'cbc:SerialID', max: 1, classRef: UdtIdentifier },
  additionalItemProperties: {
    order: 7,
    attributeName: 'cac:AdditionalItemProperty',
    max: undefined,
    classRef: () => AdditionalItemProperty,
  },
  lotIdentification: { order: 8, attributeName: 'cac:LotIdentification', max: 1, classRef: () => LotIdentification },
};

type AllowedParams = {
  /** An identifier used for tracing this item instance, such as the EPC number used in RFID. */
  productTraceID?: string | UdtIdentifier;
  /** The date on which this item instance was manufactured. */
  manufactureDate?: string | UdtDate;
  /** The time at which this item instance was manufactured. */
  manufactureTime?: string | UdtTime;
  /** The date before which it is best to use this item instance. */
  bestBeforeDate?: string | UdtDate;
  /** The registration identifier of this item instance. */
  registrationID?: string | UdtIdentifier;
  /** The serial number of this item instance. */
  serialID?: string | UdtIdentifier;
  /** An additional property of this item instance. */
  additionalItemProperties?: AdditionalItemProperty[];
  /** The lot identifier of this item instance (the identifier that allows recall of the item if necessary). */
  lotIdentification?: LotIdentification;
};

class ItemInstance extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ItemInstance');
  }
}

export { ItemInstance, AllowedParams as ItemInstanceParams };
