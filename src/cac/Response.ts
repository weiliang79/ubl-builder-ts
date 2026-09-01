import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtText, UdtTime } from '../datatypes/udt';
import { Status } from './Status';

/**
 * cac:ResponseType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ResponseType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  referenceID: { order: 1, attributeName: 'cbc:ReferenceID', max: 1, classRef: UdtIdentifier },
  responseCode: { order: 2, attributeName: 'cbc:ResponseCode', max: 1, classRef: UdtCode },
  descriptions: { order: 3, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  effectiveDate: { order: 4, attributeName: 'cbc:EffectiveDate', max: 1, classRef: UdtDate },
  effectiveTime: { order: 5, attributeName: 'cbc:EffectiveTime', max: 1, classRef: UdtTime },
  statuses: { order: 6, attributeName: 'cac:Status', max: undefined, classRef: () => Status },
};

type AllowedParams = {
  /** An identifier for the section (or line) of the document to which this response applies. */
  referenceID?: string | UdtIdentifier;
  /** A code signifying the type of response. */
  responseCode?: string | UdtCode;
  /** Text describing this response. */
  descriptions?: (string | UdtText)[];
  /** The date upon which this response is valid. */
  effectiveDate?: string | UdtDate;
  /** The time at which this response is valid. */
  effectiveTime?: string | UdtTime;
  /** A status report associated with this response. */
  statuses?: Status[];
};

class Response extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Response');
  }
}

export { Response as DiscrepancyResponse, Response, AllowedParams as ResponseParams };
