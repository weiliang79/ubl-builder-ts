import * as cac from '../../src/cac';
import {
  Attachment,
  CommodityClassification,
  ExternalReference,
  FinancialInstitution,
  FinancialInstitutionBranch,
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
  const added = {
    ExternalReference: () => new ExternalReference({ URI: 'https://example.test/a.pdf' }),
    Attachment: () => new Attachment({ externalReference: new ExternalReference({ URI: 'u' }) }),
    CommodityClassification: () => new CommodityClassification({ itemClassificationCode: '001' }),
    FinancialInstitution: () => new FinancialInstitution({ id: 'MBBEMYKL' }),
    FinancialInstitutionBranch: () => new FinancialInstitutionBranch({ id: 'BR-1' }),
    ItemPriceExtension: () => new ItemPriceExtension({ amount: '10.00' }),
    SellersItemIdentification: () => new SellersItemIdentification({ id: 'SKU-1' }),
  };

  it.each(Object.keys(added))('exports %s from ./cac and the package root', (name) => {
    expect(cac).toHaveProperty(name);
    expect(root).toHaveProperty(name);
  });

  it.each(Object.entries(added))('constructs and serialises %s', (name, build) => {
    expect(build().getAsXml(false, true, `cac:${name}`)).toContain(`<cac:${name}>`);
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
