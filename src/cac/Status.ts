import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtIndicator, UdtPercent, UdtText, UdtTime } from '../datatypes/udt';
import { Condition } from './Condition';

/**
 * cac:StatusType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:StatusType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  conditionCode: { order: 1, attributeName: 'cbc:ConditionCode', max: 1, classRef: UdtCode },
  referenceDate: { order: 2, attributeName: 'cbc:ReferenceDate', max: 1, classRef: UdtDate },
  referenceTime: { order: 3, attributeName: 'cbc:ReferenceTime', max: 1, classRef: UdtTime },
  descriptions: { order: 4, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  statusReasonCode: { order: 5, attributeName: 'cbc:StatusReasonCode', max: 1, classRef: UdtCode },
  statusReasons: { order: 6, attributeName: 'cbc:StatusReason', max: undefined, classRef: UdtText },
  sequenceID: { order: 7, attributeName: 'cbc:SequenceID', max: 1, classRef: UdtIdentifier },
  texts: { order: 8, attributeName: 'cbc:Text', max: undefined, classRef: UdtText },
  indicationIndicator: { order: 9, attributeName: 'cbc:IndicationIndicator', max: 1, classRef: UdtIndicator },
  percent: { order: 10, attributeName: 'cbc:Percent', max: 1, classRef: UdtPercent },
  reliabilityPercent: { order: 11, attributeName: 'cbc:ReliabilityPercent', max: 1, classRef: UdtPercent },
  conditions: { order: 12, attributeName: 'cac:Condition', max: undefined, classRef: () => Condition },
};

type AllowedParams = {
  /** Specifies the status condition of the related object. */
  conditionCode?: string | UdtCode;
  /** The reference date for this status. */
  referenceDate?: string | UdtDate;
  /** The reference time for this status. */
  referenceTime?: string | UdtTime;
  /** Text describing this status. */
  descriptions?: (string | UdtText)[];
  /** The reason for this status condition or position, expressed as a code. */
  statusReasonCode?: string | UdtCode;
  /** The reason for this status condition or position, expressed as text. */
  statusReasons?: (string | UdtText)[];
  /** A sequence identifier for this status. */
  sequenceID?: string | UdtIdentifier;
  /** Provides any textual information related to this status. */
  texts?: (string | UdtText)[];
  /** Specifies an indicator relevant to a specific status. */
  indicationIndicator?: string | UdtIndicator;
  /** A percentage meaningful in the context of this status. */
  percent?: string | UdtPercent;
  /** The reliability of this status, expressed as a percentage. */
  reliabilityPercent?: string | UdtPercent;
  /** Measurements that quantify the condition of the objects covered by the status. */
  conditions?: Condition[];
};

class Status extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Status');
  }
}

export { Status as CurrentStatus, Status, AllowedParams as StatusParams };
