import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtDate, UdtIdentifier, UdtText, UdtTime } from '../datatypes/udt';
import { DocumentReference } from './DocumentReference';
import { Party } from './Party';

/**
 * cac:PowerOfAttorneyType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:PowerOfAttorneyType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  issueDate: { order: 2, attributeName: 'cbc:IssueDate', max: 1, classRef: UdtDate },
  issueTime: { order: 3, attributeName: 'cbc:IssueTime', max: 1, classRef: UdtTime },
  descriptions: { order: 4, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  notaryParty: { order: 5, attributeName: 'cac:NotaryParty', max: 1, classRef: () => Party },
  agentParty: { order: 6, attributeName: 'cac:AgentParty', max: 1, classRef: () => Party },
  witnessParties: { order: 7, attributeName: 'cac:WitnessParty', max: undefined, classRef: () => Party },
  mandateDocumentReferences: {
    order: 8,
    attributeName: 'cac:MandateDocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
};

type AllowedParams = {
  /** An identifier for this power of attorney. */
  id?: string | UdtIdentifier;
  /** The date on which this power of attorney was issued. */
  issueDate?: string | UdtDate;
  /** The time at which this power of attorney was issued. */
  issueTime?: string | UdtTime;
  /** Text describing this power of attorney. */
  descriptions?: (string | UdtText)[];
  /** The party notarizing this power of attorney. */
  notaryParty?: Party;
  /** The party who acts as an agent or fiduciary for the principal and who holds this power of attorney on behalf of the principal. */
  agentParty: Party;
  /** An association to a WitnessParty. */
  witnessParties?: Party[];
  /** A reference to a mandate associated with this power of attorney. */
  mandateDocumentReferences?: DocumentReference[];
};

class PowerOfAttorney extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:PowerOfAttorney');
  }
}

export { PowerOfAttorney, AllowedParams as PowerOfAttorneyParams };
