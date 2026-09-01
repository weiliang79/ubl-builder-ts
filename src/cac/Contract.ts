import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtText, UdtTime } from '../datatypes/udt';
import { Delivery } from './Delivery';
import { DocumentReference } from './DocumentReference';
import { EstimatedDeliveryPeriod, ValidityPeriod } from './Period';

/**
 * cac:ContractType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ContractType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  issueDate: { order: 2, attributeName: 'cbc:IssueDate', max: 1, classRef: UdtDate },
  issueTime: { order: 3, attributeName: 'cbc:IssueTime', max: 1, classRef: UdtTime },
  nominationDate: { order: 4, attributeName: 'cbc:NominationDate', max: 1, classRef: UdtDate },
  nominationTime: { order: 5, attributeName: 'cbc:NominationTime', max: 1, classRef: UdtTime },
  contractTypeCode: { order: 6, attributeName: 'cbc:ContractTypeCode', max: 1, classRef: UdtCode },
  contractType: { order: 7, attributeName: 'cbc:ContractType', max: 1, classRef: UdtText },
  notes: { order: 8, attributeName: 'cbc:Note', max: undefined, classRef: UdtText },
  versionID: { order: 9, attributeName: 'cbc:VersionID', max: 1, classRef: UdtIdentifier },
  descriptions: { order: 10, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  validityPeriod: { order: 11, attributeName: 'cac:ValidityPeriod', max: 1, classRef: () => ValidityPeriod },
  contractDocumentReferences: {
    order: 12,
    attributeName: 'cac:ContractDocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  nominationPeriod: {
    order: 13,
    attributeName: 'cac:NominationPeriod',
    max: 1,
    classRef: () => EstimatedDeliveryPeriod,
  },
  contractualDelivery: { order: 14, attributeName: 'cac:ContractualDelivery', max: 1, classRef: () => Delivery },
};

type AllowedParams = {
  /** An identifier for this contract. */
  id?: string | UdtIdentifier;
  /** The date on which this contract was issued. */
  issueDate?: string | UdtDate;
  /** The time at which this contract was issued. */
  issueTime?: string | UdtTime;
  /** In a transportation contract, the deadline date by which the services referred to in the transport execution plan have to be booked. For example, if this service is a carrier service scheduled for Wednesday 16 February 2011 at 10 a.m. CET, the nomination date might be Tuesday15 February 2011. */
  nominationDate?: string | UdtDate;
  /** In a transportation contract, the deadline time by which the services referred to in the transport execution plan have to be booked. For example, if this service is a carrier service scheduled for Wednesday 16 February 2011 at 10 a.m. CET, the nomination date might be Tuesday15 February 2011 and the nomination time 4 p.m. at the latest. */
  nominationTime?: string | UdtTime;
  /** The type of this contract, expressed as a code, such as "Cost plus award fee" and "Cost plus fixed fee" from UNCEFACT Contract Type code list. */
  contractTypeCode?: string | UdtCode;
  /** The type of this contract, expressed as text, such as "Cost plus award fee" and "Cost plus fixed fee" from UNCEFACT Contract Type code list. */
  contractType?: string | UdtText;
  /** Free-form text conveying information that is not contained explicitly in other structures. */
  notes?: (string | UdtText)[];
  /** An identifier for the current version of this contract. */
  versionID?: string | UdtIdentifier;
  /** Text describing this contract. */
  descriptions?: (string | UdtText)[];
  /** The period during which this contract is valid. */
  validityPeriod?: ValidityPeriod;
  /** A reference to a contract document. */
  contractDocumentReferences?: DocumentReference[];
  /** In a transportation contract, the period required to book the services specified in the contract before the services can begin. */
  nominationPeriod?: EstimatedDeliveryPeriod;
  /** In a transportation contract, the delivery of the services required to book the services specified in the contract. */
  contractualDelivery?: Delivery;
};

class Contract extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Contract');
  }
}

export {
  Contract,
  AllowedParams as ContractParams,
  Contract as ForeignExchangeContract,
  Contract as ReferencedContract,
  Contract as TransportContract,
};
