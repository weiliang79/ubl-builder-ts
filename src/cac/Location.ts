import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtName, UdtText } from '../datatypes/udt';
import { Address } from './Address';
import { ValidityPeriod } from './Period';

/*http://www.datypic.com/sc/ubl21/e-cac_PhysicalLocation.html
cbc:ID [0..1]    An identifier for this location, e.g., the EAN Location Number, GLN.
cbc:Description [0..*]    Text describing this location.
cbc:Conditions [0..*]    Free-form text describing the physical conditions of the location.
cbc:CountrySubentity [0..1]    A territorial division of a country, such as a county or state, expressed as text.
cbc:CountrySubentityCode [0..1]    A territorial division of a country, such as a county or state, expressed as a code.
cbc:LocationTypeCode [0..1]    A code signifying the type of location.
cbc:InformationURI [0..1]    The Uniform Resource Identifier (URI) of a document providing information about this location.
cbc:Name [0..1]    The name of this location.
cac:ValidityPeriod [0..*]    A period during which this location can be used (e.g., for delivery).
cac:Address [0..1]    The address of this location.
cac:SubsidiaryLocation [0..*]    A location subsidiary to this location.
cac:LocationCoordinate [0..*]    The geographical coordinates of this location.
*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  subsidiaryLocations: {
    order: 11,
    attributeName: 'cac:SubsidiaryLocation',
    max: undefined,
    classRef: () => LocationType,
  },
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  description: { order: 2, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  conditions: { order: 3, attributeName: 'cbc:Conditions', max: undefined, classRef: UdtText },
  countrySubentity: { order: 4, attributeName: 'cbc:CountrySubentity', max: 1, classRef: UdtText },
  countrySubentityCode: { order: 5, attributeName: 'cbc:CountrySubentityCode', max: 1, classRef: UdtCode },
  locationTypeCode: { order: 6, attributeName: 'cbc:LocationTypeCode', max: 1, classRef: UdtCode },
  informationURI: { order: 7, attributeName: 'cbc:InformationURI', max: 1, classRef: UdtIdentifier },
  name: { order: 8, attributeName: 'cbc:Name', max: 1, classRef: UdtName },
  validityPeriod: {
    order: 9,
    attributeName: 'cac:ValidityPeriod',
    max: undefined,
    classRef: () => ValidityPeriod,
  },
  address: { order: 10, attributeName: 'cac:Address', max: 1, classRef: () => Address },

  // ##################################  TODO CAC MISSING ################################################

  // markCareIndicator: { order: 11,  attributeName: 'cbc:MarkCareIndicator', max:1, classRef: null  },
  // markCareIndicator: { order: 12,  attributeName: 'cbc:MarkCareIndicator', max:1, classRef: null }

  // ##################################  TODO CAC MISSING ################################################
};

type AllowedParams = {
  /** A location subsidiary to this location. */
  subsidiaryLocations?: LocationType[];
  id?: string | UdtIdentifier;
  description?: (string | UdtText)[];
  conditions?: (string | UdtText)[];
  countrySubentity?: string | UdtText;
  countrySubentityCode?: string | UdtCode;
  locationTypeCode?: string | UdtCode;
  informationURI?: string | UdtIdentifier;
  name?: string | UdtName;
  validityPeriod?: (string | ValidityPeriod)[];
  address?: string | Address;
};

/**
 *
 */
class LocationType extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:LocationType');
  }

  /**
   *
   * @param value
   */
  setAddress(value: Address) {
    if (!(value instanceof Address)) throw new Error('Value must be instance of Address');
    this.attributes.address = value;
  }
}

export {
  LocationType as AlternativeDeliveryLocation,
  LocationType as DeliveryLocation,
  LocationType as DespatchLocation,
  AllowedParams as LocationTypeParams,
  LocationType as PhysicalLocation,
};
