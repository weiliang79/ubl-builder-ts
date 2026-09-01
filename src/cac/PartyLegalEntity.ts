import { PostalAddress } from './Address';
import { Party } from './Party';
// 'use strict'

import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtAmount, UdtCode, UdtDate, UdtIdentifier, UdtIndicator, UdtName, UdtText } from '../datatypes/udt';
import { CorporateRegistrationScheme } from './CorporateRegistrationScheme';

// const GenericAggregateComponent = require("./GenericAggregateComponent");

// /* TODO GANERIC CLASSES */

// const { UdtCode, UdtIdentifier, UdtDate, UdtText, UdtTime, UdtName } = require("../types/UnqualifiedDataTypes");
// const { CorporateRegistrationScheme }= require("./CorporateRegistrationScheme");

/* TODO GANERIC CLASSES */

/*
  1  cbc:RegistrationName [0..1]    The name of the party as registered with the relevant legal authority.
  2  cbc:CompanyID [0..1]    An identifier for the party as registered within a company registration scheme.
  3  cbc:RegistrationDate [0..1]    The registration date of the CompanyID.
  4  cbc:RegistrationExpirationDate [0..1]    The date upon which a registration expires (e.g., registration for an import/export license).
  5  cbc:CompanyLegalFormCode [0..1]    A code signifying the party's legal status.
  6  cbc:CompanyLegalForm [0..1]    The company legal status, expressed as a text.
  7  cbc:SoleProprietorshipIndicator [0..1]    An indicator that the company is owned and controlled by one person (true) or not (false).
  8  cbc:CompanyLiquidationStatusCode [0..1]    A code signifying the party's liquidation status.
  9  cbc:CorporateStockAmount [0..1]    The number of shares in the capital stock of a corporation.
  10  cbc:FullyPaidSharesIndicator [0..1]    An indicator that all shares of corporate stock have been paid by shareholders (true) or not (false).
  11  cac:RegistrationAddress [0..1]    The registered address of the party within a corporate registration scheme.
  12  cac:CorporateRegistrationScheme [0..1]    The corporate registration scheme used to register the party.
  13  cac:HeadOfficeParty [0..1]    The head office of the legal entity
  14  cac:ShareholderParty [0..*]    A party owning shares in this legal entity.
*/

// ##################################  TODO CAC MISSING ################################################

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  registrationName: { order: 1, attributeName: 'cbc:RegistrationName', max: 1, classRef: UdtName },
  companyID: { order: 2, attributeName: 'cbc:CompanyID', max: 1, classRef: UdtIdentifier },
  registrationDate: { order: 3, attributeName: 'cbc:RegistrationDate', max: 1, classRef: UdtDate },
  registrationExpirationDate: {
    order: 4,
    attributeName: 'cbc:RegistrationExpirationDate',
    max: 1,
    classRef: UdtDate,
  },
  companyLegalFormCode: { order: 5, attributeName: 'cbc:CompanyLegalFormCode', max: 1, classRef: UdtCode },
  companyLegalForm: { order: 6, attributeName: 'cbc:CompanyLegalForm', max: 1, classRef: UdtText },
  soleProprietorshipIndicator: {
    order: 7,
    attributeName: 'cbc:SoleProprietorshipIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  companyLiquidationStatusCode: {
    order: 8,
    attributeName: 'cbc:CompanyLiquidationStatusCode',
    max: 1,
    classRef: UdtCode,
  },
  corporateStockAmount: { order: 9, attributeName: 'cbc:CorporateStockAmount', max: 1, classRef: UdtAmount },
  fullyPaidSharesIndicator: {
    order: 10,
    attributeName: 'cbc:FullyPaidSharesIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  registrationAddress: {
    order: 11,
    attributeName: 'cac:RegistrationAddress',
    max: 1,
    classRef: () => PostalAddress,
  },
  corporateRegistrationScheme: {
    order: 12,
    attributeName: 'cac:CorporateRegistrationScheme',
    max: 1,
    classRef: () => CorporateRegistrationScheme,
  },
  headOfficeParty: { order: 13, attributeName: 'cac:HeadOfficeParty', max: 1, classRef: () => Party },
};

type AllowedParams = {
  /** The registration date of the CompanyID. */
  registrationDate?: string | UdtDate;
  /** The date upon which a registration expires (e.g., registration for an import/export license). */
  registrationExpirationDate?: string | UdtDate;
  /** A code signifying the party's legal status. */
  companyLegalFormCode?: string | UdtCode;
  /** The company legal status, expressed as a text. */
  companyLegalForm?: string | UdtText;
  /** An indicator that the company is owned and controlled by one person (true) or not (false). */
  soleProprietorshipIndicator?: string | UdtIndicator;
  /** A code signifying the party's liquidation status. */
  companyLiquidationStatusCode?: string | UdtCode;
  /** The number of shares in the capital stock of a corporation. */
  corporateStockAmount?: string | UdtAmount;
  /** An indicator that all shares of corporate stock have been paid by shareholders (true) or not (false). */
  fullyPaidSharesIndicator?: string | UdtIndicator;
  /** The registered address of the party within a corporate registration scheme. */
  registrationAddress?: PostalAddress;
  /** The head office of the legal entity */
  headOfficeParty?: Party;
  registrationName?: string | UdtName;
  companyID?: string | UdtIdentifier;
  corporateRegistrationScheme?: CorporateRegistrationScheme;
};

/**
 * More info: http://www.datypic.com/sc/ubl21/e-cac_PartyLegalEntity.html
 */
class PartyLegalEntity extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:PartyLegalEntity');
  }

  /**
   *
   * @param value
   */
  setCorporateRegistrationScheme(value: CorporateRegistrationScheme) {
    if (value instanceof CorporateRegistrationScheme) {
      this.attributes.corporateRegistrationScheme = value;
    } else {
      throw new Error('value must to be instance of CorporateRegistrationScheme');
    }
  }
}

export { PartyLegalEntity, AllowedParams as PartyLegalEntityParams };
