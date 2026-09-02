import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtText } from '../datatypes/udt';
import { AirTransport } from './AirTransport';
import { MeasurementDimension } from './Dimension';
import { MaritimeTransport } from './MaritimeTransport';
import { Party } from './Party';
import { RailTransport } from './RailTransport';
import { RoadTransport } from './RoadTransport';
import { Stowage } from './Stowage';

/**
 * cac:TransportMeansType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:TransportMeansType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  journeyID: { order: 1, attributeName: 'cbc:JourneyID', max: 1, classRef: UdtIdentifier },
  registrationNationalityID: {
    order: 2,
    attributeName: 'cbc:RegistrationNationalityID',
    max: 1,
    classRef: UdtIdentifier,
  },
  registrationNationalities: {
    order: 3,
    attributeName: 'cbc:RegistrationNationality',
    max: undefined,
    classRef: UdtText,
  },
  directionCode: { order: 4, attributeName: 'cbc:DirectionCode', max: 1, classRef: UdtCode },
  transportMeansTypeCode: { order: 5, attributeName: 'cbc:TransportMeansTypeCode', max: 1, classRef: UdtCode },
  tradeServiceCode: { order: 6, attributeName: 'cbc:TradeServiceCode', max: 1, classRef: UdtCode },
  stowage: { order: 7, attributeName: 'cac:Stowage', max: 1, classRef: () => Stowage },
  airTransport: { order: 8, attributeName: 'cac:AirTransport', max: 1, classRef: () => AirTransport },
  roadTransport: { order: 9, attributeName: 'cac:RoadTransport', max: 1, classRef: () => RoadTransport },
  railTransport: { order: 10, attributeName: 'cac:RailTransport', max: 1, classRef: () => RailTransport },
  maritimeTransport: { order: 11, attributeName: 'cac:MaritimeTransport', max: 1, classRef: () => MaritimeTransport },
  ownerParty: { order: 12, attributeName: 'cac:OwnerParty', max: 1, classRef: () => Party },
  measurementDimensions: {
    order: 13,
    attributeName: 'cac:MeasurementDimension',
    max: undefined,
    classRef: () => MeasurementDimension,
  },
};

type AllowedParams = {
  /** An identifier for the regular service schedule of this means of transport. */
  journeyID?: string | UdtIdentifier;
  /** An identifier for the country in which this means of transport is registered. */
  registrationNationalityID?: string | UdtIdentifier;
  /** Text describing the country in which this means of transport is registered. */
  registrationNationalities?: (string | UdtText)[];
  /** A code signifying the direction of this means of transport. */
  directionCode?: string | UdtCode;
  /** A code signifying the type of this means of transport (truck, vessel, etc.). */
  transportMeansTypeCode?: string | UdtCode;
  /** A code signifying the service regularly provided by the carrier operating this means of transport. */
  tradeServiceCode?: string | UdtCode;
  /** The location within the means of transport where goods are to be or have been stowed. */
  stowage?: Stowage;
  /** An aircraft used for transport. */
  airTransport?: AirTransport;
  /** A vehicle used for road transport. */
  roadTransport?: RoadTransport;
  /** Equipment used for rail transport. */
  railTransport?: RailTransport;
  /** A vessel used for transport by water (not only by sea). */
  maritimeTransport?: MaritimeTransport;
  /** The party that owns this means of transport. */
  ownerParty?: Party;
  /** A measurable dimension (length, mass, weight, or volume) of this means of transport. */
  measurementDimensions?: MeasurementDimension[];
};

class TransportMeans extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TransportMeans');
  }
}

export { TransportMeans as ApplicableTransportMeans, TransportMeans, AllowedParams as TransportMeansParams };
