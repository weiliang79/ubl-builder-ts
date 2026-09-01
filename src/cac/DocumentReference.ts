/* tslint:disable:max-classes-per-file */

/* TODO GANERIC CLASSES */
import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtIndicator, UdtText, UdtTime } from '../datatypes/udt';
/* TODO GANERIC CLASSES */

import { Attachment } from './Attachment';
import { IssuerParty } from './Party';
import { ValidityPeriod } from './Period';

// const { ValidityPeriod, ValidityPeriodParams } = require("./ValidityPeriod");

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  issuerParty: { order: 16, attributeName: 'cac:IssuerParty', max: 1, classRef: () => IssuerParty },
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  copyIndicator: { order: 2, attributeName: 'cbc:CopyIndicator', max: 1, classRef: UdtIndicator },
  uuid: { order: 3, attributeName: 'cbc:UUID', max: 1, classRef: UdtIdentifier },
  issueDate: { order: 4, attributeName: 'cbc:IssueDate', max: 1, classRef: UdtDate },
  issueTime: { order: 5, attributeName: 'cbc:IssueTime', max: 1, classRef: UdtTime },
  documentTypeCode: { order: 6, attributeName: 'cbc:DocumentTypeCode', max: 1, classRef: UdtCode },
  documentType: { order: 7, attributeName: 'cbc:DocumentType', max: 1, classRef: UdtText },
  xPath: { order: 8, attributeName: 'cbc:XPath', max: undefined, classRef: UdtText },
  languageID: { order: 9, attributeName: 'cbc:LanguageID', max: 1, classRef: UdtIdentifier },
  localeCode: { order: 10, attributeName: 'cbc:LocaleCode', max: 1, classRef: UdtCode },
  versionID: { order: 11, attributeName: 'cbc:VersionID', max: 1, classRef: UdtIdentifier },
  documentStatusCode: { order: 12, attributeName: 'cbc:DocumentStatusCode', max: 1, classRef: UdtCode },
  documentDescription: {
    order: 13,
    attributeName: 'cbc:DocumentDescription',
    max: undefined,
    classRef: UdtText,
  },
  attachment: { order: 14, attributeName: 'cac:Attachment', max: 1, classRef: () => Attachment },
  validityPeriod: { order: 15, attributeName: 'cac:ValidityPeriod', max: 1, classRef: () => ValidityPeriod },
  //                                   TODO CAC MISSING
  // resultOfVerification: { order: 17, attributeName: 'cac:ResultOfVerification', max: 1, classRef: null },
  //                                   TODO CAC MISSING
};

/**
 *
 */
/**
 * An interface to define the allowed params for document reference.
 *
 * @property {string} id - The id of the component.
 * @property {string} [copyIndicator] - The copy indicator of the component.
 * @property {UDTIdentifier|string} [uuid] - The uuid of the component.
 * @property {string} [issueDate] - The issue date of the component.
 * @property {string} [issueTime] - The issue time of the component.
 * @property {UDTCode|string} [documentTypeCode] - The document type code of the component.
 * @property {string} [documentType] - The document type of the component.
 * @property {string[]} [xPath] - The x path of the component.
 * @property {string} [languageID] - The language id of the component.
 * @property {string} [localeCode] - The locale code of the component.
 * @property {string} [versionID] - The version id of the component.
 * @property {string} [documentStatusCode] - The document status code of the component.
 * @property {string[]} [documentDescription] - The document description of the component.
 * @property {string} [attachment] - The attachment of the component.
 * @property {string} [validityPeriod] - The validity period of the component.
 * @property {IssuerParty} [issuerParty] - The party who issued the referenced document.
 */
interface AllowedParams {
  id: string | UdtIdentifier;
  copyIndicator?: string | UdtIndicator;
  uuid?: UdtIdentifier | string;
  issueDate?: string | UdtDate;
  issueTime?: string | UdtTime;
  documentTypeCode?: UdtCode | string;
  documentType?: string | UdtText;
  xPath?: (string | UdtText)[];
  languageID?: string | UdtIdentifier;
  localeCode?: string | UdtCode;
  versionID?: string | UdtIdentifier;
  documentStatusCode?: string | UdtCode;
  documentDescription?: (string | UdtText)[];
  attachment?: Attachment;
  validityPeriod?: ValidityPeriod;
  issuerParty?: IssuerParty;
}

class DespatchDocumentReference extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:DespatchDocumentReference');
  }
}

/**
 * A class to define a reference to an Order.
 */
class DocumentReference extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:DocumentReference');
  }

  /**
   * @param value
   */
  setCopyIndicator(value: boolean | UdtIndicator) {
    this.attributes.copyIndicator = value instanceof UdtIndicator ? value : new UdtIndicator(value);
    return this;
  }
}

class InvoiceDocumentReference extends GenericAggregateComponent {
  /**
   * @param content
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:InvoiceDocumentReference');
  }
}

class ReceiptDocumentReference extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ReceiptDocumentReference');
  }
}

class StatementDocumentReference extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   * @param {string} name
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:StatementDocumentReference');
  }
}

class OriginatorDocumentReference extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:OriginatorDocumentReference');
  }
}

class ContractDocumentReference extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ContractDocumentReference');
  }
}

class AdditionalDocumentReference extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   * @param {string} name
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:AdditionalDocumentReference');
  }
}

export {
  AdditionalDocumentReference,
  AllowedParams as AdditionalDocumentReferenceParams,
  ContractDocumentReference,
  AllowedParams as ContractDocumentReferenceParams,
  DespatchDocumentReference,
  AllowedParams as DespatchDocumentReferenceParams,
  DocumentReference,
  AllowedParams as DocumentReferenceParams,
  InvoiceDocumentReference,
  AllowedParams as InvoiceDocumentReferenceParams,
  OriginatorDocumentReference,
  AllowedParams as OriginatorDocumentReferenceParams,
  ReceiptDocumentReference,
  AllowedParams as ReceiptDocumentReferenceParams,
  StatementDocumentReference,
  AllowedParams as StatementDocumentReferenceParams,
};
