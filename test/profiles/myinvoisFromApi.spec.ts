import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AccountingCustomerParty,
  AccountingSupplierParty,
  AddressLine,
  CommodityClassification,
  Contact,
  Country,
  InvoiceLine,
  Item,
  ItemPriceExtension,
  LegalMonetaryTotal,
  Party,
  PartyIdentification,
  PartyLegalEntity,
  PeriodType,
  PostalAddress,
  Price,
  TaxCategory,
  TaxSubtotal,
  TaxTotal,
} from '../../src/cac';
import { UdtAmount, UdtCode, UdtIdentifier, UdtQuantity, UdtText } from '../../src/datatypes/udt';
import { Invoice } from '../../src/documents';
import {
  CLASSIFICATION_ATTRIBUTES,
  COUNTRY_CODE_ATTRIBUTES,
  DocumentTypeCode,
  DocumentVersion,
  IdentificationScheme,
  myInvois,
  otherTaxScheme,
  TaxCategoryCode,
} from '../../src/profiles/myinvois';

/**
 * The public API reproduces a document MyInvois accepted in production.
 *
 * `test/fixtures/myinvois-invoice.xml` is modelled on real accepted invoices —
 * the same pair that established the AllowanceTotalAmount convention recorded
 * in `profiles/myinvois/profile.ts`. Every other gate in this repo checks the
 * model against the *schema*: that a params map matches its complex type, that
 * classRefs resolve, that the output canonicalizes. None of them checks that a
 * caller can actually reach that output through the constructors and setters.
 *
 * That gap is real. A rename or an arity change in a params map keeps every
 * schema gate green while breaking every caller, and this repo has no other
 * test that writes an invoice the way a user does.
 *
 * The two mistakes a first draft against this API makes are pinned at the
 * bottom of this file, because they fail very differently: a misspelled key
 * throws, while a plain object where an instance is required emits an empty
 * element and says nothing.
 *
 * Byte-exact rather than structural, deliberately: an assertion that the
 * documents "look similar" would not have caught a dropped optional element,
 * and `documentHash` is computed over exactly these bytes.
 */

const FIXTURE = join(__dirname, '..', 'fixtures', 'myinvois-invoice.xml');
const CURRENCY = 'MYR';

const money = (value: string) => new UdtAmount(value, { currencyID: CURRENCY });
const identity = (value: string, schemeID: string) =>
  new PartyIdentification({ id: new UdtIdentifier(value, { schemeID }) });

/** MyInvois routes every tax type through the UN/ECE 5153 "other" scheme. */
const notApplicableTax = () => new TaxCategory({ id: TaxCategoryCode.NotApplicable, taxScheme: otherTaxScheme() });

const address = (lines: string[]) =>
  new PostalAddress({
    cityName: 'KUALA LUMPUR',
    postalZone: '50000',
    countrySubentityCode: '14',
    addressLines: lines.map((line) => new AddressLine({ line })),
    country: new Country({ identificationCode: new UdtCode('MYS', COUNTRY_CODE_ATTRIBUTES) }),
  });

/** Build the fixture through the public API, as a caller would. */
function buildInvoice(): Invoice {
  const invoice = new Invoice('INV-0000-00001');
  myInvois.defaults!(invoice);

  invoice
    .setIssueDate('2026-07-02')
    .setIssueTime('02:02:36Z')
    .setInvoiceTypeCode(DocumentTypeCode.Invoice, { listVersionID: DocumentVersion.Unsigned })
    .setDocumentCurrencyCode(CURRENCY)
    .setTaxCurrencyCode(CURRENCY);

  invoice.addInvoicePeriod(
    new PeriodType({
      startDate: '2026-06-08',
      startTime: '02:20:02Z',
      endDate: '2026-06-08',
      endTime: '02:20:02Z',
    }),
  );

  invoice.setAccountingSupplierParty(
    new AccountingSupplierParty({
      party: new Party({
        industryClassificationCode: new UdtCode('86909', { name: 'EXAMPLE MEDICAL SERVICES' }),
        partyIdentifications: [
          identity('C00000000000', IdentificationScheme.Tin),
          identity('000000000000', IdentificationScheme.BusinessRegistration),
          identity('NA', IdentificationScheme.SalesTax),
          identity('NA', IdentificationScheme.TourismTax),
        ],
        postalAddress: address(['1 Jalan Contoh']),
        partyLegalEntities: [new PartyLegalEntity({ registrationName: 'EXAMPLE CLINIC SDN. BHD.' })],
        contact: new Contact({ name: 'EXAMPLE CLINIC SDN. BHD.', telephone: '+60312345678' }),
      }),
    }),
  );

  invoice.setAccountingCustomerParty(
    new AccountingCustomerParty({
      party: new Party({
        partyIdentifications: [
          identity('IG00000000000', IdentificationScheme.Tin),
          identity('000000000000', IdentificationScheme.Nric),
          identity('NA', IdentificationScheme.SalesTax),
          identity('NA', IdentificationScheme.TourismTax),
        ],
        postalAddress: address(['2 Jalan Contoh', 'Taman Contoh']),
        partyLegalEntities: [new PartyLegalEntity({ registrationName: 'EXAMPLE BUYER' })],
        contact: new Contact({ name: 'EXAMPLE BUYER', telephone: '+60312345679' }),
      }),
    }),
  );

  invoice.addTaxTotal(
    new TaxTotal({
      taxAmount: money('0.00'),
      taxSubtotals: [
        new TaxSubtotal({ taxableAmount: money('0.00'), taxAmount: money('0.00'), taxCategory: notApplicableTax() }),
      ],
    }),
  );

  invoice.setLegalMonetaryTotal(
    new LegalMonetaryTotal({
      lineExtensionAmount: money('90.00'),
      taxExclusiveAmount: money('90.00'),
      taxInclusiveAmount: money('90.00'),
      payableAmount: money('90.00'),
    }),
  );

  invoice.addInvoiceLine(
    new InvoiceLine({
      id: '1',
      invoicedQuantity: new UdtQuantity('60.00', { unitCode: 'XUN' }),
      lineExtensionAmount: money('90.00'),
      taxTotals: [
        new TaxTotal({
          taxAmount: money('0.00'),
          taxSubtotals: [
            new TaxSubtotal({ taxAmount: money('0.00'), percent: '0.00', taxCategory: notApplicableTax() }),
          ],
        }),
      ],
      item: new Item({
        descriptions: [new UdtText('Consultation')],
        commodityClassification: [
          new CommodityClassification({ itemClassificationCode: new UdtCode('020', CLASSIFICATION_ATTRIBUTES) }),
        ],
      }),
      price: new Price({ priceAmount: money('1.50') }),
      itemPriceExtension: new ItemPriceExtension({ amount: money('90.00') }),
    }),
  );

  return invoice;
}

describe('building the MyInvois fixture through the public API', () => {
  it('reproduces the accepted document byte for byte', () => {
    // If this fails, read the diff as "the API a caller writes against has
    // moved", not "the fixture is stale". The fixture is the accepted shape.
    expect(buildInvoice().getXml(false, true)).toBe(readFileSync(FIXTURE, 'utf8'));
  });

  it('is the 4542 bytes documentHash would be computed over', () => {
    // Named explicitly because the number is load-bearing elsewhere: the
    // parser tests assert the same figure for round-tripping, and a
    // submission's documentHash covers exactly these bytes.
    expect(Buffer.byteLength(buildInvoice().getXml(false, true), 'utf8')).toBe(4542);
  });

  it('rejects a misspelled params key loudly', () => {
    // The plural names are easy to get wrong — partyLegalEntities,
    // descriptions, commodityClassification are all array-valued while the
    // element they emit is singular. That mistake is safe: assignContent has
    // no such key and says so.
    expect(() => new Party({ partyLegalEntity: new PartyLegalEntity({ registrationName: 'X' }) } as never)).toThrow(
      /attribute partyLegalEntity is not allowed/,
    );
  });

  it('does NOT reject a plain object where a component instance is required', () => {
    // The failure mode that is actually dangerous, pinned so nobody discovers
    // it against LHDN. buildClassInstance reads any object as
    // `{ content, attributes }`, so a params object in a position typed for an
    // instance yields an EMPTY element instead of raising — a document that is
    // schema-valid and quietly missing its content.
    //
    // The declared types are the only thing standing between a caller and
    // this, which is why every aggregate child in this library is typed as an
    // instance and never as `Thing | ThingParams`.
    const party = new Party({ partyLegalEntities: [{ registrationName: 'X' }] as never });

    expect(party.getAsXml(false, true)).toContain('<cac:PartyLegalEntity/>');
    expect(party.getAsXml(false, true)).not.toContain('EXAMPLE');
  });
});
