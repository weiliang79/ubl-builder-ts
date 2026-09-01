import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtName, UdtText } from '../datatypes/udt';
import { Address } from './Address';
import { Contact } from './Contact';
import { DocumentReference } from './DocumentReference';
import { PayeeFinancialAccount } from './PayeeFinancialAccount';

/**
 * cac:PersonType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:PersonType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  firstName: { order: 2, attributeName: 'cbc:FirstName', max: 1, classRef: UdtName },
  familyName: { order: 3, attributeName: 'cbc:FamilyName', max: 1, classRef: UdtName },
  title: { order: 4, attributeName: 'cbc:Title', max: 1, classRef: UdtText },
  middleName: { order: 5, attributeName: 'cbc:MiddleName', max: 1, classRef: UdtName },
  otherName: { order: 6, attributeName: 'cbc:OtherName', max: 1, classRef: UdtName },
  nameSuffix: { order: 7, attributeName: 'cbc:NameSuffix', max: 1, classRef: UdtText },
  jobTitle: { order: 8, attributeName: 'cbc:JobTitle', max: 1, classRef: UdtText },
  nationalityID: { order: 9, attributeName: 'cbc:NationalityID', max: 1, classRef: UdtIdentifier },
  genderCode: { order: 10, attributeName: 'cbc:GenderCode', max: 1, classRef: UdtCode },
  birthDate: { order: 11, attributeName: 'cbc:BirthDate', max: 1, classRef: UdtDate },
  birthplaceName: { order: 12, attributeName: 'cbc:BirthplaceName', max: 1, classRef: UdtText },
  organizationDepartment: { order: 13, attributeName: 'cbc:OrganizationDepartment', max: 1, classRef: UdtText },
  contact: { order: 14, attributeName: 'cac:Contact', max: 1, classRef: () => Contact },
  financialAccount: { order: 15, attributeName: 'cac:FinancialAccount', max: 1, classRef: () => PayeeFinancialAccount },
  identityDocumentReferences: {
    order: 16,
    attributeName: 'cac:IdentityDocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  residenceAddress: { order: 17, attributeName: 'cac:ResidenceAddress', max: 1, classRef: () => Address },
};

type AllowedParams = {
  /** An identifier for this person. */
  id?: string | UdtIdentifier;
  /** This person's given name. */
  firstName?: string | UdtName;
  /** This person's family name. */
  familyName?: string | UdtName;
  /** This person's title of address (e.g., Mr, Ms, Dr, Sir). */
  title?: string | UdtText;
  /** This person's middle name(s) or initials. */
  middleName?: string | UdtName;
  /** This person's second family name. */
  otherName?: string | UdtName;
  /** A suffix to this person's name (e.g., PhD, OBE, Jr). */
  nameSuffix?: string | UdtText;
  /** This person's job title (for a particular role) within an organization. */
  jobTitle?: string | UdtText;
  /** An identifier for this person's nationality. */
  nationalityID?: string | UdtIdentifier;
  /** A code (e.g., ISO 5218) signifying the gender of this person. */
  genderCode?: string | UdtCode;
  /** This person's date of birth. */
  birthDate?: string | UdtDate;
  /** The name of the place where this person was born, expressed as text. */
  birthplaceName?: string | UdtText;
  /** The department or subdivision of an organization that this person belongs to (in a particular role). */
  organizationDepartment?: string | UdtText;
  /** Contact information for this person. */
  contact?: Contact;
  /** The financial account associated with this person. */
  financialAccount?: PayeeFinancialAccount;
  /** A reference to a document that can precisely identify this person (e.g., a driver's license). */
  identityDocumentReferences?: DocumentReference[];
  /** This person's address of residence. */
  residenceAddress?: Address;
};

class Person extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Person');
  }
}

export {
  Person as CrewMemberPerson,
  Person as DriverPerson,
  Person as MasterPerson,
  Person as PassengerPerson,
  Person,
  AllowedParams as PersonParams,
  Person as ReportingPerson,
  Person as SecurityOfficerPerson,
  Person as ShipsSurgeonPerson,
  Person as TechnicalCommitteePerson,
};
