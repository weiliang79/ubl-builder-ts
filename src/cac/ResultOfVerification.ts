import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtIdentifier, UdtText, UdtTime } from '../datatypes/udt';
import { Party } from './Party';

/**
 * cac:ResultOfVerificationType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ResultOfVerificationType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  validatorID: { order: 1, attributeName: 'cbc:ValidatorID', max: 1, classRef: UdtIdentifier },
  validationResultCode: { order: 2, attributeName: 'cbc:ValidationResultCode', max: 1, classRef: UdtCode },
  validationDate: { order: 3, attributeName: 'cbc:ValidationDate', max: 1, classRef: UdtDate },
  validationTime: { order: 4, attributeName: 'cbc:ValidationTime', max: 1, classRef: UdtTime },
  validateProcess: { order: 5, attributeName: 'cbc:ValidateProcess', max: 1, classRef: UdtText },
  validateTool: { order: 6, attributeName: 'cbc:ValidateTool', max: 1, classRef: UdtText },
  validateToolVersion: { order: 7, attributeName: 'cbc:ValidateToolVersion', max: 1, classRef: UdtText },
  signatoryParty: { order: 8, attributeName: 'cac:SignatoryParty', max: 1, classRef: () => Party },
};

type AllowedParams = {
  /** An identifier for the organization, person, service, or server that verified the signature. */
  validatorID?: string | UdtIdentifier;
  /** A code signifying the result of the verification. */
  validationResultCode?: string | UdtCode;
  /** The date upon which verification took place. */
  validationDate?: string | UdtDate;
  /** The time at which verification took place. */
  validationTime?: string | UdtTime;
  /** The verification process. */
  validateProcess?: string | UdtText;
  /** The tool used to verify the signature. */
  validateTool?: string | UdtText;
  /** The version of the tool used to verify the signature. */
  validateToolVersion?: string | UdtText;
  /** The signing party. */
  signatoryParty?: Party;
};

class ResultOfVerification extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ResultOfVerification');
  }
}

export { ResultOfVerification, AllowedParams as ResultOfVerificationParams };
