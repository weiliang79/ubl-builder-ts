import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier } from '../datatypes/udt';
import { IssuerParty } from './Party';

/**
 * cac:CustomsDeclarationType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:CustomsDeclarationType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  issuerParty: { order: 2, attributeName: 'cac:IssuerParty', max: 1, classRef: () => IssuerParty },
};

type AllowedParams = {
  /** An identifier associated with customs related procedures. */
  id: string | UdtIdentifier;
  /** Describes the party issuing the customs declaration. */
  issuerParty?: IssuerParty;
};

class CustomsDeclaration extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:CustomsDeclaration');
  }
}

export { CustomsDeclaration, AllowedParams as CustomsDeclarationParams };
