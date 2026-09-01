import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';

import { UdtCode, UdtIdentifier, UdtIdentifierAttributes, UdtName, UdtText } from '../datatypes/udt';

/* TODO GENERIC CLASSES */
import { AddressLine } from './AddressLine';
import { Country } from './Country';
import { LocationCoordinate } from './LocationCoordinate';

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  locationCoordinates: {
    order: 27,
    attributeName: 'cac:LocationCoordinate',
    max: undefined,
    classRef: () => LocationCoordinate,
  },
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  addressTypeCode: { order: 2, attributeName: 'cbc:AddressTypeCode', max: 1, classRef: UdtCode },
  addressFormatCode: { order: 3, attributeName: 'cbc:AddressFormatCode', max: 1, classRef: UdtCode },
  postbox: { order: 4, attributeName: 'cbc:Postbox', max: 1, classRef: UdtText },
  floor: { order: 5, attributeName: 'cbc:Floor', max: 1, classRef: UdtText },
  room: { order: 6, attributeName: 'cbc:Room', max: 1, classRef: UdtText },
  streetName: { order: 7, attributeName: 'cbc:StreetName', max: 1, classRef: UdtName },
  additionalStreetName: { order: 8, attributeName: 'cbc:AdditionalStreetName', max: 1, classRef: UdtName },
  blockName: { order: 9, attributeName: 'cbc:BlockName', max: 1, classRef: UdtName },
  buildingName: { order: 10, attributeName: 'cbc:BuildingName', max: 1, classRef: UdtName },
  buildingNumber: { order: 11, attributeName: 'cbc:BuildingNumber', max: 1, classRef: UdtText },
  inhouseMail: { order: 12, attributeName: 'cbc:InhouseMail', max: 1, classRef: UdtText },
  department: { order: 13, attributeName: 'cbc:Department', max: 1, classRef: UdtText },
  markAttention: { order: 14, attributeName: 'cbc:MarkAttention', max: 1, classRef: UdtText },
  markCare: { order: 15, attributeName: 'cbc:MarkCare', max: 1, classRef: UdtText },
  plotIdentification: { order: 16, attributeName: 'cbc:PlotIdentification', max: 1, classRef: UdtText },
  citySubdivisionName: { order: 17, attributeName: 'cbc:CitySubdivisionName', max: 1, classRef: UdtName },
  cityName: { order: 18, attributeName: 'cbc:CityName', max: 1, classRef: UdtName },
  postalZone: { order: 19, attributeName: 'cbc:PostalZone', max: 1, classRef: UdtText },
  countrySubentity: { order: 20, attributeName: 'cbc:CountrySubentity', max: 1, classRef: UdtText },
  countrySubentityCode: { order: 21, attributeName: 'cbc:CountrySubentityCode', max: 1, classRef: UdtCode },
  region: { order: 22, attributeName: 'cbc:Region', max: 1, classRef: UdtText },
  district: { order: 23, attributeName: 'cbc:District', max: 1, classRef: UdtText },
  timezoneOffset: { order: 24, attributeName: 'cbc:TimezoneOffset', max: 1, classRef: UdtText },
  addressLines: { order: 25, attributeName: 'cac:AddressLine', max: undefined, classRef: () => AddressLine },
  country: { order: 26, attributeName: 'cac:Country', max: 1, classRef: () => Country },
};

type AllowedParams = {
  /** The geographical coordinates of this address. */
  locationCoordinates?: LocationCoordinate[];
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
  /** The name of the street, road, avenue, way, etc. to which the number of the building is attached. */
  streetName?: string | UdtName;
  /** An additional street name used to further clarify the address. */
  additionalStreetName?: string | UdtName;
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
  /** The postal identifier for this address according to the relevant national postal service, such as a ZIP code or Post Code. */
  postalZone?: string | UdtText;
  /** The recognized geographic or economic region or group of countries in which this address is located. */
  region?: string | UdtText;
  /** The district or geographical division of a country or region in which this address is located. */
  district?: string | UdtText;
  /** The time zone in which this address is located (as an offset from Universal Coordinated Time (UTC)) at the time of exchange. */
  timezoneOffset?: string | UdtText;
  /** An identifier for this address within an agreed scheme of address identifiers */
  id?: string | UdtIdentifier;
  /** The name of a city, town, or village */
  cityName?: string | UdtName;
  /** The political or administrative division of a country in which this address is located, such as the name of its county, province, or state, expressed as text */
  countrySubentity?: string | UdtText;
  /** The political or administrative division of a country in which this address is located, such as a county, province, or state, expressed as a code (typically nationally agreed) */
  countrySubentityCode?: string | UdtCode;
  /** An unstructured address line */
  addressLines?: AddressLine[];
  /**  The country in which this address is situated */
  country?: Country;
};

/**
 * cac:AddressType
 * A class to define common information related to an address.
 * Namespace: urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2
 */
class Address extends GenericAggregateComponent {
  /**     *
   * @param {AllowedParams} content
   * @param {string} name
   */
  constructor(content: AllowedParams) {
    // cac:Address, not cac:AddressType. The default is only used when a
    // component is serialised on its own — in a document the parent's params
    // map supplies the name — but cac:AddressType is a *type* name and no such
    // element exists, so getAsXml() with no override emitted XML the XSD
    // rejects.
    super(content, ParamsMap, 'cac:Address');
  }

  addAddressLine(value: string | AddressLine) {
    if (!this.attributes.addressLines) {
      this.attributes.addressLines = [];
    }
    const itemToPush = value instanceof AddressLine ? value : new AddressLine({ line: value });
    this.attributes.addressLines.push(itemToPush);
  }

  setCountry(value: string | Country) {
    if (value instanceof Country) {
      this.attributes.country = value;
    } else if (typeof value === 'string') {
      this.attributes.country = new Country({ name: value });
    } else {
      this.attributes.country = new Country(value);
    }
  }

  /**
   *
   * @param value
   * @param attributes
   */
  setId(value: string | UdtIdentifier, attributes: UdtIdentifierAttributes) {
    this.attributes.id = value instanceof UdtIdentifier ? value : new UdtIdentifier(value, attributes);
  }
}

/*
 * One class, one alias per element it serves — the convention Party.ts,
 * TaxTotal.ts and Period.ts all follow. Twelve UBL elements are AddressType;
 * these are the ones this package references. cac:ApplicableAddress,
 * cac:ApplicableTerritoryAddress, cac:LocationAddress and cac:ResidenceAddress
 * belong to types that have no component class yet.
 */
export {
  Address,
  AllowedParams as AddressParams,
  Address as DeliveryAddress,
  Address as DespatchAddress,
  Address as JurisdictionRegionAddress,
  Address as OriginAddress,
  Address as PostalAddress,
  AllowedParams as PostalAddressTypeParams,
  Address as RegistrationAddress,
  Address as ReturnAddress,
};
