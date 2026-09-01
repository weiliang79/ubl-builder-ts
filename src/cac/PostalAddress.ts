import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtName, UdtText } from '../datatypes/udt';
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
  addressTypeCode: { order: 2, attributeName: 'cbc:AddressTypeCode', max: 1, classRef: UdtCode },
  addressFormatCode: { order: 3, attributeName: 'cbc:AddressFormatCode', max: 1, classRef: UdtCode },
  postbox: { order: 4, attributeName: 'cbc:Postbox', max: 1, classRef: UdtText },
  floor: { order: 5, attributeName: 'cbc:Floor', max: 1, classRef: UdtText },
  room: { order: 6, attributeName: 'cbc:Room', max: 1, classRef: UdtText },
  blockName: { order: 9, attributeName: 'cbc:BlockName', max: 1, classRef: UdtName },
  buildingName: { order: 10, attributeName: 'cbc:BuildingName', max: 1, classRef: UdtName },
  buildingNumber: { order: 11, attributeName: 'cbc:BuildingNumber', max: 1, classRef: UdtText },
  inhouseMail: { order: 12, attributeName: 'cbc:InhouseMail', max: 1, classRef: UdtText },
  department: { order: 13, attributeName: 'cbc:Department', max: 1, classRef: UdtText },
  markAttention: { order: 14, attributeName: 'cbc:MarkAttention', max: 1, classRef: UdtText },
  markCare: { order: 15, attributeName: 'cbc:MarkCare', max: 1, classRef: UdtText },
  plotIdentification: { order: 16, attributeName: 'cbc:PlotIdentification', max: 1, classRef: UdtText },
  citySubdivisionName: { order: 17, attributeName: 'cbc:CitySubdivisionName', max: 1, classRef: UdtName },
  region: { order: 22, attributeName: 'cbc:Region', max: 1, classRef: UdtText },
  district: { order: 23, attributeName: 'cbc:District', max: 1, classRef: UdtText },
  timezoneOffset: { order: 24, attributeName: 'cbc:TimezoneOffset', max: 1, classRef: UdtText },
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
  /** A mutually agreed code signifying the type of this address. */
  addressTypeCode?: string | UdtCode;
  /** A mutually agreed code signifying the format of this address. */
  addressFormatCode?: string | UdtCode;
  /** A post office box number registered for postal delivery by a postal service provider. */
  postbox?: string | UdtText;
  /** An identifiable floor of a building. */
  floor?: string | UdtText;
  /** An identifiable room, suite, or apartment of a building. */
  room?: string | UdtText;
  /** The name of the block (an area surrounded by streets and usually containing several buildings) in which this address is located. */
  blockName?: string | UdtName;
  /** The name of a building. */
  buildingName?: string | UdtName;
  /** The number of a building within the street. */
  buildingNumber?: string | UdtText;
  /** The specific identifable location within a building where mail is delivered. */
  inhouseMail?: string | UdtText;
  /** The department of the addressee. */
  department?: string | UdtText;
  /** The name, expressed as text, of a person or department in an organization to whose attention incoming mail is directed; corresponds to the printed forms "for the attention of", "FAO", and ATTN:". */
  markAttention?: string | UdtText;
  /** The name, expressed as text, of a person or organization at this address into whose care incoming mail is entrusted; corresponds to the printed forms "care of" and "c/o". */
  markCare?: string | UdtText;
  /** An identifier (e.g., a parcel number) for the piece of land associated with this address. */
  plotIdentification?: string | UdtText;
  /** The name of the subdivision of a city, town, or village in which this address is located, such as the name of its district or borough. */
  citySubdivisionName?: string | UdtName;
  /** The recognized geographic or economic region or group of countries in which this address is located. */
  region?: string | UdtText;
  /** The district or geographical division of a country or region in which this address is located. */
  district?: string | UdtText;
  /** The time zone in which this address is located (as an offset from Universal Coordinated Time (UTC)) at the time of exchange. */
  timezoneOffset?: string | UdtText;
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
