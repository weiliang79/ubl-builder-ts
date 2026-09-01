import { DespatchDocumentReference, IssuerParty, PostalAddress } from '../../src/cac';
import { ItemPriceExtension } from '../../src/cac/ItemPriceExtension';
import { TaxTotal } from '../../src/cac/TaxTotal';

/**
 * Three components — DocumentReference, PostalAddress and ItemPriceExtension —
 * declare `interface AllowedParams` where the other 49 use a type alias, and
 * every generator scan matched only the alias. They were exempt from
 * check:schema, check:types and generate:complete for as long as they have
 * existed, and PostalAddress had 9 of the 27 children AddressType defines.
 *
 * These are the 19 the generator added once it could see them. The gates now
 * cover the metadata; what they cannot do is prove the entries serialise, which
 * is what fails when a classRef or an element name is wrong.
 */
describe('components completed against the schema', () => {
  it('emits every PostalAddress child in schema sequence', () => {
    // One value per child AddressType defines, in a deliberately scrambled
    // declaration order: the assertion is that toNode() sorts by `order`, so
    // passing them out of order is the point.
    const address = new PostalAddress({
      timezoneOffset: '+08:00',
      district: 'Klang',
      region: 'Selangor',
      citySubdivisionName: 'Bangsar',
      plotIdentification: 'PLOT-9',
      markCare: 'c/o Finance',
      markAttention: 'FAO Accounts',
      department: 'Accounts Payable',
      inhouseMail: 'Bag 12',
      buildingNumber: '1',
      buildingName: 'Menara Satu',
      blockName: 'Block A',
      room: 'Room 3',
      floor: '2',
      postbox: 'Po Box 351',
      addressFormatCode: 'StructuredMY',
      addressTypeCode: 'Business',
      id: 'ADDR-1',
      streetName: 'Main Street',
      additionalStreetName: 'Jalan Dua',
      cityName: 'Kuala Lumpur',
      postalZone: '50000',
      countrySubentity: 'Wilayah Persekutuan',
    });

    expect(address.getAsXml(false, true, 'cac:PostalAddress')).toBe(
      '<cac:PostalAddress>' +
        '<cbc:ID>ADDR-1</cbc:ID>' +
        '<cbc:AddressTypeCode>Business</cbc:AddressTypeCode>' +
        '<cbc:AddressFormatCode>StructuredMY</cbc:AddressFormatCode>' +
        '<cbc:Postbox>Po Box 351</cbc:Postbox>' +
        '<cbc:Floor>2</cbc:Floor>' +
        '<cbc:Room>Room 3</cbc:Room>' +
        '<cbc:StreetName>Main Street</cbc:StreetName>' +
        '<cbc:AdditionalStreetName>Jalan Dua</cbc:AdditionalStreetName>' +
        '<cbc:BlockName>Block A</cbc:BlockName>' +
        '<cbc:BuildingName>Menara Satu</cbc:BuildingName>' +
        '<cbc:BuildingNumber>1</cbc:BuildingNumber>' +
        '<cbc:InhouseMail>Bag 12</cbc:InhouseMail>' +
        '<cbc:Department>Accounts Payable</cbc:Department>' +
        '<cbc:MarkAttention>FAO Accounts</cbc:MarkAttention>' +
        '<cbc:MarkCare>c/o Finance</cbc:MarkCare>' +
        '<cbc:PlotIdentification>PLOT-9</cbc:PlotIdentification>' +
        '<cbc:CitySubdivisionName>Bangsar</cbc:CitySubdivisionName>' +
        '<cbc:CityName>Kuala Lumpur</cbc:CityName>' +
        '<cbc:PostalZone>50000</cbc:PostalZone>' +
        '<cbc:CountrySubentity>Wilayah Persekutuan</cbc:CountrySubentity>' +
        '<cbc:Region>Selangor</cbc:Region>' +
        '<cbc:District>Klang</cbc:District>' +
        '<cbc:TimezoneOffset>+08:00</cbc:TimezoneOffset>' +
        '</cac:PostalAddress>',
    );
  });

  it('nests an IssuerParty in a document reference', () => {
    // `issuerParty` was declared as `string` with no params-map entry behind
    // it, so the only thing the type accepted threw from the constructor.
    const ref = new DespatchDocumentReference({
      id: 'DN-1',
      issuerParty: new IssuerParty({ markCareIndicator: 'true' }),
    });

    expect(ref.getAsXml(false, true, 'cac:DespatchDocumentReference')).toBe(
      '<cac:DespatchDocumentReference>' +
        '<cbc:ID>DN-1</cbc:ID>' +
        '<cac:IssuerParty><cbc:MarkCareIndicator>true</cbc:MarkCareIndicator></cac:IssuerParty>' +
        '</cac:DespatchDocumentReference>',
    );
  });

  it('takes more than one xPath and documentDescription', () => {
    // Both are maxOccurs="unbounded" and were declared as single values.
    const ref = new DespatchDocumentReference({
      id: 'DN-1',
      xPath: ['/a', '/b'],
      documentDescription: ['first', 'second'],
    });
    const xml = ref.getAsXml(false, true, 'cac:DespatchDocumentReference');

    expect(xml).toContain('<cbc:XPath>/a</cbc:XPath><cbc:XPath>/b</cbc:XPath>');
    expect(xml).toContain('<cbc:DocumentDescription>first</cbc:DocumentDescription>');
    expect(xml).toContain('<cbc:DocumentDescription>second</cbc:DocumentDescription>');
  });

  it('carries tax totals on an item price extension', () => {
    const extension = new ItemPriceExtension({
      amount: '10.00',
      taxTotals: [new TaxTotal({ taxAmount: '0.60' })],
    });

    expect(extension.getAsXml(false, true, 'cac:ItemPriceExtension')).toBe(
      '<cac:ItemPriceExtension>' +
        '<cbc:Amount>10.00</cbc:Amount>' +
        '<cac:TaxTotal><cbc:TaxAmount>0.60</cbc:TaxAmount></cac:TaxTotal>' +
        '</cac:ItemPriceExtension>',
    );
  });
});
