import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtIndicator } from '../datatypes/udt';
import { Contact } from './Contact';
import { Language } from './Language';
import { PhysicalLocation } from './Location';
import { PartyIdentification, PartyIdentificationParams } from './PartyIdentification';
import { PartyLegalEntity } from './PartyLegalEntity';
import { PartyName } from './PartyName';
import { PartyTaxScheme, PartyTaxSchemeParams } from './PartyTaxScheme';
import { PayeeFinancialAccount } from './PayeeFinancialAccount';
import { PostalAddress } from './PostalAddress';

/*
    cbc:MarkCareIndicator [0..1]    An indicator that this party is "care of" (c/o) (true) or not (false).
    cbc:MarkAttentionIndicator [0..1]    An indicator that this party is "for the attention of" (FAO) (true) or not (false).
    cbc:WebsiteURI [0..1]    The Uniform Resource Identifier (URI) that identifies this party's web site; i.e., the web site's Uniform Resource Locator (URL).
    cbc:LogoReferenceID [0..1]    An identifier for this party's logo.
    cbc:EndpointID [0..1]    An identifier for the end point of the routing service (e.g., EAN Location Number, GLN).
    cbc:IndustryClassificationCode [0..1]    This party's Industry Classification Code.
    cac:PartyIdentification [0..*]    An identifier for this party.
    cac:PartyName [0..*]    A name for this party.
    cac:Language [0..1]    The language associated with this party.
    cac:PostalAddress [0..1]    The party's postal address.
    cac:PhysicalLocation [0..1]    The physical location of this party.
    cac:PartyTaxScheme [0..*]    A tax scheme applying to this party.
    cac:PartyLegalEntity [0..*]    A description of this party as a legal entity.
    cac:Contact [0..1]    The primary contact for this party.
    cac:Person [0..*]    A person associated with this party.
    cac:AgentParty [0..1]    A party who acts as an agent for this party.
    cac:ServiceProviderParty [0..*]    A party providing a service to this party.
    cac:PowerOfAttorney [0..*]    A power of attorney associated with this party.
    cac:FinancialAccount [0..1]    The financial account associated with this party.
*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  financialAccount: { order: 19, attributeName: 'cac:FinancialAccount', max: 1, classRef: PayeeFinancialAccount },
  agentParty: { order: 16, attributeName: 'cac:AgentParty', max: 1, classRef: () => Party },
  markCareIndicator: { order: 1, attributeName: 'cbc:MarkCareIndicator', max: 1, classRef: UdtIndicator },
  markAttentionIndicator: {
    order: 2,
    attributeName: 'cbc:MarkAttentionIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  websiteURI: { order: 3, attributeName: 'cbc:WebsiteURI', max: 1, classRef: UdtIdentifier },
  logoReferenceID: { order: 4, attributeName: 'cbc:LogoReferenceID', max: 1, classRef: UdtIdentifier },
  EndpointID: { order: 5, attributeName: 'cbc:EndpointID', max: 1, classRef: UdtIdentifier },
  industryClassificationCode: {
    order: 6,
    attributeName: 'cbc:IndustryClassificationCode',
    max: 1,
    classRef: UdtCode,
  },
  partyIdentifications: {
    order: 7,
    attributeName: 'cac:PartyIdentification',
    max: undefined,
    classRef: () => PartyIdentification,
  },
  partyNames: { order: 8, attributeName: 'cac:PartyName', max: undefined, classRef: () => PartyName },
  language: { order: 9, attributeName: 'cac:Language', max: 1, classRef: () => Language },
  postalAddress: { order: 10, attributeName: 'cac:PostalAddress', max: 1, classRef: () => PostalAddress }, //
  physicalLocation: {
    order: 11,
    attributeName: 'cac:PhysicalLocation',
    max: 1,
    classRef: () => PhysicalLocation,
  },
  partyTaxSchemes: {
    order: 12,
    attributeName: 'cac:PartyTaxScheme',
    max: undefined,
    classRef: () => PartyTaxScheme,
  },
  partyLegalEntities: {
    order: 13,
    attributeName: 'cac:PartyLegalEntity',
    max: undefined,
    classRef: () => PartyLegalEntity,
  },
  contact: { order: 14, attributeName: 'cac:Contact', max: 1, classRef: () => Contact },
  // person: { order: 15,  attributeName: 'cac:Person', max: undefined, classRef: () => PostalAddress },
  // serviceProviderParty: { order: 17,  attributeName: 'cac:ServiceProviderParty', max: undefined, classRef: ServiceProviderParty },
  // powerOfAttorney: { order: 18,  attributeName: 'cac:PowerOfAttorney', max: undefined, classRef: PowerOfAttorney },

  // ##################################  TODO CAC MISSING ################################################
};

type AllowedParams = {
  /** The financial account associated with this party. */
  financialAccount?: PayeeFinancialAccount;
  /** A party who acts as an agent for this party. */
  agentParty?: Party;
  /**  An indicator that this party is "care of" (c/o) (true) or not (false) */
  markCareIndicator?: UdtIndicator | string;
  /** An indicator that this party is "for the attention of" (FAO) (true) or not (false) */
  markAttentionIndicator?: UdtIndicator | string;
  /** The Uniform Resource Identifier (URI) that identifies this party's web site; i.e., the web site's Uniform Resource Locator (URL) */
  websiteURI?: UdtIdentifier | string;
  /** An identifier for this party's logo */
  logoReferenceID?: UdtIdentifier | string;
  /** An identifier for the end point of the routing service (e.g., EAN Location Number, GLN) */
  EndpointID?: UdtIdentifier | string;
  /** This party's Industry Classification Code */
  industryClassificationCode?: UdtCode | string;
  /**  An identifier for this party */
  partyIdentifications?: PartyIdentification[];
  /**  A name for this party */
  partyNames?: PartyName[];
  /** The language associated with this party */
  language?: Language;

  // ##################################  TODO CAC MISSING ################################################

  // physicalLocation: "The physical location of this party.",
  partyTaxSchemes?: PartyTaxScheme[];
  partyLegalEntities?: PartyLegalEntity[];
  contact?: Contact;
  postalAddress?: PostalAddress;
  // person: { order: 15,  attributeName: 'cac:Person', max: 1, classRef: PostalAddress },
  // serviceProviderParty: { order: 17,  attributeName: 'cac:ServiceProviderParty', max: 1, classRef: ServiceProviderParty },
  // powerOfAttorney: { order: 18,  attributeName: 'cac:PowerOfAttorney', max: 1, classRef: PowerOfAttorney },

  // ##################################  TODO CAC MISSING ################################################

  physicalLocation?: PhysicalLocation;
};

/**
 * A class to describe an organization, sub-organization, or individual fulfilling a role in a business process.
 * More info http://www.datypic.com/sc/ubl21/e-cac_IssuerParty.html
 */
class Party extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   */
  constructor(content?: AllowedParams) {
    super(content, ParamsMap, 'cac:IssueParty');
  }

  addPartyName(value: PartyName | string) {
    if (!this.attributes.partyNames) {
      this.attributes.partyNames = [];
    }
    if (!(value instanceof PartyName) && typeof value !== 'string') {
      throw new Error('Value must be instance of PartyName or a string');
    }
    const itemToPush = value instanceof PartyName ? value : new PartyName({ name: value });
    this.attributes.partyNames.push(itemToPush);
  }

  setPhysicalLocation(value: PhysicalLocation) {
    if (!(value instanceof PhysicalLocation)) throw new Error('Value must be instance of PhysicalLocation ');

    this.attributes.physicalLocation = value;
  }

  /**
   *
   * @param value
   */
  addPartyTaxScheme(value: PartyTaxScheme | PartyTaxSchemeParams) {
    if (!this.attributes.partyTaxSchemes) {
      this.attributes.partyTaxSchemes = [];
    }
    const itemToPush = value instanceof PartyTaxScheme ? value : new PartyTaxScheme(value);

    this.attributes.partyTaxSchemes.push(itemToPush);
  }

  /**
   * @param { PartyLegalEntity } value
   */
  addPartyLegalEntity(value: PartyLegalEntity) {
    if (!this.attributes.partyLegalEntities) this.attributes.partyLegalEntities = [];
    if (value instanceof PartyLegalEntity) {
      this.attributes.partyLegalEntities.push(value);
    } else {
      throw new Error('Value must to be instance of PartyLegalEntity');
    }
  }

  /**
   *
   * @param value
   */
  setContact(value: Contact) {
    if (!(value instanceof Contact)) throw new Error('Value must to be instance of Contact');
    this.attributes.contact = value;
  }

  addPartyIdentification(value: PartyIdentification | PartyIdentificationParams) {
    if (!this.attributes.partyIdentifications) {
      this.attributes.partyIdentifications = [];
    }
    const itemToPush = value instanceof PartyIdentification ? value : new PartyIdentification(value);
    this.attributes.partyIdentifications.push(itemToPush);

    return this;
  }

  /**
   * @returns { [PartyTaxScheme] } Taxscheme list
   */
  getTaxSchemes() {
    return this.attributes.partyTaxSchemes;
  }
}

export {
  Party as CarrierParty,
  Party as DeliveryParty,
  Party as DespatchParty,
  Party as IssuerParty,
  AllowedParams as IssuerPartyParams,
  Party as NotifyParty,
  Party,
  AllowedParams as PartyParams,
  Party as TaxRepresentativeParty,
};
