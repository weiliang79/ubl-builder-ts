import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtText } from '../datatypes/udt';

/**
 * cac:CommunicationType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:CommunicationType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  channelCode: { order: 1, attributeName: 'cbc:ChannelCode', max: 1, classRef: UdtCode },
  channel: { order: 2, attributeName: 'cbc:Channel', max: 1, classRef: UdtText },
  value: { order: 3, attributeName: 'cbc:Value', max: 1, classRef: UdtText },
};

type AllowedParams = {
  /** The method of communication, expressed as a code. */
  channelCode?: string | UdtCode;
  /** The method of communication, expressed as text. */
  channel?: string | UdtText;
  /** An identifying value (phone number, email address, etc.) for this channel of communication */
  value?: string | UdtText;
};

class Communication extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Communication');
  }
}

export { Communication, AllowedParams as CommunicationParams, Communication as OtherCommunication };
