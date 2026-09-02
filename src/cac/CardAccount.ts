import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtName } from '../datatypes/udt';

/**
 * cac:CardAccountType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:CardAccountType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  primaryAccountNumberID: { order: 1, attributeName: 'cbc:PrimaryAccountNumberID', max: 1, classRef: UdtIdentifier },
  networkID: { order: 2, attributeName: 'cbc:NetworkID', max: 1, classRef: UdtIdentifier },
  cardTypeCode: { order: 3, attributeName: 'cbc:CardTypeCode', max: 1, classRef: UdtCode },
  validityStartDate: { order: 4, attributeName: 'cbc:ValidityStartDate', max: 1, classRef: UdtDate },
  expiryDate: { order: 5, attributeName: 'cbc:ExpiryDate', max: 1, classRef: UdtDate },
  issuerID: { order: 6, attributeName: 'cbc:IssuerID', max: 1, classRef: UdtIdentifier },
  issueNumberID: { order: 7, attributeName: 'cbc:IssueNumberID', max: 1, classRef: UdtIdentifier },
  cV2ID: { order: 8, attributeName: 'cbc:CV2ID', max: 1, classRef: UdtIdentifier },
  cardChipCode: { order: 9, attributeName: 'cbc:CardChipCode', max: 1, classRef: UdtCode },
  chipApplicationID: { order: 10, attributeName: 'cbc:ChipApplicationID', max: 1, classRef: UdtIdentifier },
  holderName: { order: 11, attributeName: 'cbc:HolderName', max: 1, classRef: UdtName },
};

type AllowedParams = {
  /** An identifier of the card (e.g., the Primary Account Number (PAN)). */
  primaryAccountNumberID: string | UdtIdentifier;
  /** An identifier for the financial service network provider of the card. */
  networkID: string | UdtIdentifier;
  /** A mutually agreed code signifying the type of card. Examples of types are "debit", "credit" and "purchasing" */
  cardTypeCode?: string | UdtCode;
  /** The date from which the card is valid. */
  validityStartDate?: string | UdtDate;
  /** The date on which the card expires. */
  expiryDate?: string | UdtDate;
  /** An identifier for the institution issuing the card. */
  issuerID?: string | UdtIdentifier;
  /** An identifier for the card, specified by the issuer. */
  issueNumberID?: string | UdtIdentifier;
  /** An identifier for the Card Verification Value (often found on the reverse of the card itself). */
  cV2ID?: string | UdtIdentifier;
  /** A mutually agreed code to distinguish between CHIP and MAG STRIPE cards. */
  cardChipCode?: string | UdtCode;
  /** An identifier on the chip card for the application that provides the quoted information; an AID (application ID). */
  chipApplicationID?: string | UdtIdentifier;
  /** The name of the cardholder. */
  holderName?: string | UdtName;
};

class CardAccount extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:CardAccount');
  }
}

export { CardAccount, AllowedParams as CardAccountParams };
