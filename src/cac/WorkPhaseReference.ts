import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtPercent, UdtText } from '../datatypes/udt';
import { DocumentReference } from './DocumentReference';

/**
 * cac:WorkPhaseReferenceType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:WorkPhaseReferenceType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  workPhaseCode: { order: 2, attributeName: 'cbc:WorkPhaseCode', max: 1, classRef: UdtCode },
  workPhases: { order: 3, attributeName: 'cbc:WorkPhase', max: undefined, classRef: UdtText },
  progressPercent: { order: 4, attributeName: 'cbc:ProgressPercent', max: 1, classRef: UdtPercent },
  startDate: { order: 5, attributeName: 'cbc:StartDate', max: 1, classRef: UdtDate },
  endDate: { order: 6, attributeName: 'cbc:EndDate', max: 1, classRef: UdtDate },
  workOrderDocumentReferences: {
    order: 7,
    attributeName: 'cac:WorkOrderDocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
};

type AllowedParams = {
  /** An identifier for this phase of work. */
  id?: string | UdtIdentifier;
  /** A code signifying this phase of work. */
  workPhaseCode?: string | UdtCode;
  /** Text describing this phase of work. */
  workPhases?: (string | UdtText)[];
  /** The progress percentage of the work phase. */
  progressPercent?: string | UdtPercent;
  /** The date on which this phase of work begins. */
  startDate?: string | UdtDate;
  /** The date on which this phase of work ends. */
  endDate?: string | UdtDate;
  /** A reference to a document regarding the work order for the project in which this phase of work takes place. */
  workOrderDocumentReferences?: DocumentReference[];
};

class WorkPhaseReference extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:WorkPhaseReference');
  }
}

export { WorkPhaseReference, AllowedParams as WorkPhaseReferenceParams };
