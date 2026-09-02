import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode } from '../datatypes/udt';
import { MaximumTemperature, MinimumTemperature } from './Temperature';

/**
 * cac:HazardousGoodsTransitType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:HazardousGoodsTransitType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  transportEmergencyCardCode: { order: 1, attributeName: 'cbc:TransportEmergencyCardCode', max: 1, classRef: UdtCode },
  packingCriteriaCode: { order: 2, attributeName: 'cbc:PackingCriteriaCode', max: 1, classRef: UdtCode },
  hazardousRegulationCode: { order: 3, attributeName: 'cbc:HazardousRegulationCode', max: 1, classRef: UdtCode },
  inhalationToxicityZoneCode: { order: 4, attributeName: 'cbc:InhalationToxicityZoneCode', max: 1, classRef: UdtCode },
  transportAuthorizationCode: { order: 5, attributeName: 'cbc:TransportAuthorizationCode', max: 1, classRef: UdtCode },
  maximumTemperature: { order: 6, attributeName: 'cac:MaximumTemperature', max: 1, classRef: () => MaximumTemperature },
  minimumTemperature: { order: 7, attributeName: 'cac:MinimumTemperature', max: 1, classRef: () => MinimumTemperature },
};

type AllowedParams = {
  /** An identifier for a transport emergency card describing the actions to be taken in an emergency in transporting the hazardous goods. It may be the identity number of a hazardous emergency response plan assigned by the appropriate authority. */
  transportEmergencyCardCode?: string | UdtCode;
  /** A code signifying the packaging requirement for transportation of the hazardous goods as assigned by IATA, IMDB, ADR, RID etc. */
  packingCriteriaCode?: string | UdtCode;
  /** A code signifying the set of legal regulations governing the transportation of the hazardous goods. */
  hazardousRegulationCode?: string | UdtCode;
  /** A code signifying the Inhalation Toxicity Hazard Zone for the hazardous goods, as defined by the US Department of Transportation. */
  inhalationToxicityZoneCode?: string | UdtCode;
  /** A code signifying authorization for the transportation of hazardous cargo. */
  transportAuthorizationCode?: string | UdtCode;
  /** The maximum temperature at which the hazardous goods can safely be transported. */
  maximumTemperature?: MaximumTemperature;
  /** The minimum temperature at which the hazardous goods can safely be transported. */
  minimumTemperature?: MinimumTemperature;
};

class HazardousGoodsTransit extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:HazardousGoodsTransit');
  }
}

export { HazardousGoodsTransit, AllowedParams as HazardousGoodsTransitParams };
