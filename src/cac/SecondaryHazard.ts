import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtText } from '../datatypes/udt';

/**
 * cac:SecondaryHazardType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:SecondaryHazardType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  placardNotation: { order: 2, attributeName: 'cbc:PlacardNotation', max: 1, classRef: UdtText },
  placardEndorsement: { order: 3, attributeName: 'cbc:PlacardEndorsement', max: 1, classRef: UdtText },
  emergencyProceduresCode: { order: 4, attributeName: 'cbc:EmergencyProceduresCode', max: 1, classRef: UdtCode },
  extensions: { order: 5, attributeName: 'cbc:Extension', max: undefined, classRef: UdtText },
};

type AllowedParams = {
  /** An identifier for this secondary hazard. */
  id?: string | UdtIdentifier;
  /** Text of the placard notation corresponding to the hazard class of this secondary hazard. Can also be the hazard identification number of the orange placard (upper part) required on the means of transport. */
  placardNotation?: string | UdtText;
  /** Text of the placard endorsement for this secondary hazard that is to be shown on the shipping papers for a hazardous item. Can also be used for the number of the orange placard (lower part) required on the means of transport. */
  placardEndorsement?: string | UdtText;
  /** A code signifying the emergency procedures for this secondary hazard. */
  emergencyProceduresCode?: string | UdtCode;
  /** Additional information about the hazardous substance, which can be used (for example) to specify the type of regulatory requirements that apply to this secondary hazard. */
  extensions?: (string | UdtText)[];
};

class SecondaryHazard extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:SecondaryHazard');
  }
}

export { SecondaryHazard, AllowedParams as SecondaryHazardParams };
