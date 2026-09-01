import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier, UdtText } from '../datatypes/udt';
import { AddressLine } from './AddressLine';
import { Country } from './Country';

/**
   cac:PostalAddress
    │
    ├─ cbc:ID (0..1)
    ├─ cbc:AddressTypeCode (0..1)
    ├─ cbc:AddressFormatCode (0..1)
    ├─ cbc:Postbox (0..1)
    ├─ cbc:Floor (0..1)
    ├─ cbc:Room (0..1)
    ├─ cbc:StreetName (0..1)
    ├─ cbc:AdditionalStreetName (0..1)
    ├─ cbc:BlockName (0..1)
    ├─ cbc:BuildingName (0..1)
    ├─ cbc:BuildingNumber (0..1)
    ├─ cbc:InhouseMail (0..1)
    ├─ cbc:Department (0..1)
    ├─ cbc:MarkAttention (0..1)
    ├─ cbc:MarkCare (0..1)
    ├─ cbc:PlotIdentification (0..1)
    ├─ cbc:CitySubdivisionName (0..1)
    ├─ cbc:CityName (0..1)
    ├─ cbc:PostalZone (0..1)
    ├─ cbc:CountrySubentity (0..1)
    ├─ cbc:CountrySubentityCode (0..1)
    ├─ cbc:Region (0..1)
    ├─ cbc:District (0..1)
    │
    ├─ cac:AddressLine (0..n)
    │   └─ cbc:Line (1..1)
    │
    ├─ cac:Country (1..1)
    │   └─ cbc:IdentificationCode (1..1)
    │
    └─ cac:LocationCoordinate (0..n)
        ├─ cbc:CoordinateSystemCode (0..1)
        ├─ cbc:LatitudeDegreesMeasure (0..1)
        ├─ cbc:LatitudeMinutesMeasure (0..1)
        ├─ cbc:LatitudeDirectionCode (0..1)
        ├─ cbc:LongitudeDegreesMeasure (0..1)
        ├─ cbc:LongitudeMinutesMeasure (0..1)
        └─ cbc:LongitudeDirectionCode (0..1)
 */

/**
 * TODO: implement full list of attributes
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  streetName: { order: 7, attributeName: 'cbc:StreetName', max: 1, classRef: UdtText },
  additionalStreetName: { order: 8, attributeName: 'cbc:AdditionalStreetName', max: 1, classRef: UdtText },
  cityName: { order: 18, attributeName: 'cbc:CityName', max: 1, classRef: UdtText },
  postalZone: { order: 19, attributeName: 'cbc:PostalZone', max: 1, classRef: UdtText },
  countrySubentity: { order: 20, attributeName: 'cbc:CountrySubentity', max: 1, classRef: UdtText },
  countrySubentityCode: { order: 21, attributeName: 'cbc:CountrySubentityCode', max: 1, classRef: UdtText },
  addressLine: { order: 25, attributeName: 'cac:AddressLine', max: undefined, classRef: () => AddressLine },
  country: { order: 26, attributeName: 'cac:Country', max: 1, classRef: () => Country },
};

interface AllowedParams {
  /* Seller address identifier. The identifier for an addressable group of properties according to the relevant postal service. Example value: 1 */
  id?: string | UdtIdentifier;
  /* Seller address line 1. The main address line in an address. Example value: Main Street 1 */
  streetName?: string | UdtText;
  /* Seller address line 2. An additional address line in an address that can be used to give further details supplementing the main line. Example value: Po Box 351 */
  additionalStreetName?: string | UdtText;
  /* 	Seller city. The common name of the city, town or village, where the Seller address is located. Example value: London */
  cityName?: string | UdtText;
  /* Seller post code. The identifier for an addressable group of properties according to the relevant postal service. Example value: W1G 8LZ */
  postalZone?: string | UdtText;
  /* Seller country subdivision. The subdivision of a country. Example value: Region A */
  countrySubentity?: string | UdtText;
  /* Seller country subdivision. The subdivision of a country. Example value: Region A */
  countrySubentityCode?: string | UdtText;
  /* Seller address line. The main address line in an address. Example value: Main Street 1 */
  addressLine?: AddressLine[];
  /* COUNTRY */
  country?: Country;
}

/**
 *
 */
class PostalAddress extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:PostalAddress');
  }

  addAddressLine(value: AddressLine | string) {
    if (!this.attributes.addressLine) {
      this.attributes.addressLine = [];
    }

    if (!(value instanceof AddressLine) && typeof value !== 'string') {
      throw new Error('Value must be instance of AddressLine or a string');
    }

    const itemToPush = value instanceof AddressLine ? value : new AddressLine({ line: value });
    this.attributes.addressLine.push(itemToPush);

    return this;
  }
}

export { PostalAddress, AllowedParams as PostalAddressTypeParams };
