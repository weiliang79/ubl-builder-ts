import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtPercent } from '../datatypes/udt';
import { Party } from './Party';

/**
 * cac:ShareholderPartyType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ShareholderPartyType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  partecipationPercent: { order: 1, attributeName: 'cbc:PartecipationPercent', max: 1, classRef: UdtPercent },
  party: { order: 2, attributeName: 'cac:Party', max: 1, classRef: () => Party },
};

type AllowedParams = {
  /** The shareholder participation, expressed as a percentage. */
  partecipationPercent?: string | UdtPercent;
  /** The shareholder party. */
  party?: Party;
};

class ShareholderParty extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ShareholderParty');
  }
}

export { ShareholderParty, AllowedParams as ShareholderPartyParams };
