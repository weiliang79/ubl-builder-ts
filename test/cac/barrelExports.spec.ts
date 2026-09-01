import * as cac from '../../src/cac';
import {
  Address,
  AddressParams,
  Attachment,
  CommodityClassification,
  ExternalReference,
  FinancialInstitution,
  FinancialInstitutionBranch,
  IssuerParty,
  IssuerPartyParams,
  ItemPriceExtension,
  SellersItemIdentification,
} from '../../src/cac';
import * as root from '../../src/index';

/**
 * `./cac/<file>` is not an exported subpath of the package, so the barrel is
 * the only way in. Seven component classes were missing from it and could
 * therefore not be named by any consumer at all — including Attachment and
 * ExternalReference, which `DocumentReference.attachment` needs before anyone
 * can set it.
 *
 * check:types fails on a component the barrel omits. This is the other half:
 * that what the barrel exports can be constructed and serialised, which a scan
 * of export statements cannot tell you.
 */
describe('the cac barrel', () => {
  // The expected XML is spelled out rather than checked with toContain: the
  // wrapper element is an argument to getAsXml, so asserting the output
  // contains it passes for a component that serialises nothing at all.
  const added: [string, () => { getAsXml(p: boolean, h: boolean, n: string): string }, string][] = [
    [
      'ExternalReference',
      () => new ExternalReference({ URI: 'https://example.test/a.pdf' }),
      '<cbc:URI>https://example.test/a.pdf</cbc:URI>',
    ],
    [
      'Attachment',
      () => new Attachment({ externalReference: new ExternalReference({ URI: 'u' }) }),
      '<cac:ExternalReference><cbc:URI>u</cbc:URI></cac:ExternalReference>',
    ],
    [
      'CommodityClassification',
      () => new CommodityClassification({ itemClassificationCode: '001' }),
      '<cbc:ItemClassificationCode>001</cbc:ItemClassificationCode>',
    ],
    ['FinancialInstitution', () => new FinancialInstitution({ id: 'MBBEMYKL' }), '<cbc:ID>MBBEMYKL</cbc:ID>'],
    ['FinancialInstitutionBranch', () => new FinancialInstitutionBranch({ id: 'BR-1' }), '<cbc:ID>BR-1</cbc:ID>'],
    ['ItemPriceExtension', () => new ItemPriceExtension({ amount: '10.00' }), '<cbc:Amount>10.00</cbc:Amount>'],
    ['SellersItemIdentification', () => new SellersItemIdentification({ id: 'SKU-1' }), '<cbc:ID>SKU-1</cbc:ID>'],
  ];

  it.each(added.map(([name]) => name))('exports %s from ./cac and the package root', (name) => {
    expect(cac).toHaveProperty(name);
    expect(root).toHaveProperty(name);
  });

  it.each(added)('constructs and serialises %s', (name, build, inner) => {
    expect(build().getAsXml(false, true, `cac:${name}`)).toBe(`<cac:${name}>${inner}</cac:${name}>`);
  });

  it('exports params types that can be used as types', () => {
    // AddressParams named the Address *class*, so this annotation did not
    // compile and Address had no usable params type at all. If either name
    // regresses to a class binding, this file stops compiling.
    const address: AddressParams = { streetName: 'Main Street', cityName: 'Kuala Lumpur' };
    const issuer: IssuerPartyParams = { markCareIndicator: 'true' };

    expect(new Address(address).getAsXml(false, true, 'cac:Address')).toBe(
      '<cac:Address><cbc:StreetName>Main Street</cbc:StreetName><cbc:CityName>Kuala Lumpur</cbc:CityName></cac:Address>',
    );
    expect(new IssuerParty(issuer).getAsXml(false, true, 'cac:IssuerParty')).toBe(
      '<cac:IssuerParty><cbc:MarkCareIndicator>true</cbc:MarkCareIndicator></cac:IssuerParty>',
    );
  });

  it('reaches a financial institution through its branch', () => {
    const branch = new FinancialInstitutionBranch({
      id: 'BR-1',
      financialInstitution: new FinancialInstitution({ id: 'MBBEMYKL' }),
    });

    expect(branch.getAsXml(false, true, 'cac:FinancialInstitutionBranch')).toBe(
      '<cac:FinancialInstitutionBranch>' +
        '<cbc:ID>BR-1</cbc:ID>' +
        '<cac:FinancialInstitution><cbc:ID>MBBEMYKL</cbc:ID></cac:FinancialInstitution>' +
        '</cac:FinancialInstitutionBranch>',
    );
  });
});
