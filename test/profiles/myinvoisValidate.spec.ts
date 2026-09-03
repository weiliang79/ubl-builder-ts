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
  PostalAddress,
  Price,
  TaxCategory,
  TaxSubtotal,
  TaxTotal,
} from '../../src/cac';
import { UdtAmount, UdtCode, UdtIdentifier, UdtText } from '../../src/datatypes/udt';
import { Invoice } from '../../src/documents';
import {
  CLASSIFICATION_ATTRIBUTES,
  COUNTRY_CODE_ATTRIBUTES,
  DocumentTypeCode,
  DocumentVersion,
  GENERAL_PUBLIC_TIN,
  IdentificationScheme,
  myInvois,
  MyInvoisValidationError,
  otherTaxScheme,
  TaxCategoryCode,
  validateInvoice,
} from '../../src/profiles/myinvois';

/**
 * The offline MyInvois rules.
 *
 * Nothing here is inferred from documentation. The consolidated classification
 * rule was learned by having LHDN's preprod API reject a real submission, and
 * the shapes pinned as passing are ones it accepted.
 *
 * A second rule was learned the same way and was WRONG. 0.4.0 required buyer
 * state code 17 on a consolidated document, reported as LHDN's own `CV317`.
 * The rejection it came from differed from the accepted document in two places
 * at once, and the wrong one was credited; LHDN later accepted state code 14 on
 * a consolidated invoice outright. It is removed, and the lesson is in the
 * tests below: a rule earns its place from a submission that changed ONE
 * thing. The presence rules are admitted only if the element appears in
 * BOTH documents this repo knows LHDN accepted.
 *
 * The most important tests in this file are the first three. A validator's real
 * risk is not that it misses something — it is that it blocks a document LHDN
 * would have accepted, because the only workaround for that is to stop using
 * it. Every accepted shape available is therefore pinned as passing before any
 * rule is tested for firing.
 */

const FIXTURE = join(__dirname, '..', 'fixtures', 'myinvois-invoice.xml');
const SIGNED_SAMPLE = join(__dirname, '..', 'fixtures', 'lhdn', 'one-doc-signed.xml');
const CURRENCY = 'MYR';

const money = (value: string) => new UdtAmount(value, { currencyID: CURRENCY });
const zeroRatedTax = () =>
  new TaxTotal({
    taxAmount: money('0.00'),
    taxSubtotals: [
      new TaxSubtotal({
        taxableAmount: money('0.00'),
        taxAmount: money('0.00'),
        taxCategory: new TaxCategory({ id: TaxCategoryCode.NotApplicable, taxScheme: otherTaxScheme() }),
      }),
    ],
  });

interface PartyShape {
  tin: string;
  /** `null` drops the attribute, which is what a bare string does. */
  tinScheme?: string | null;
  state: string;
  country: string;
  supplier?: boolean;
  name?: PartyLegalEntity[];
}

/** A party carrying everything MyInvois requires, varied only where a test needs it. */
function completeParty({ tin, tinScheme = IdentificationScheme.Tin, state, country, supplier, name }: PartyShape): Party {
  return new Party({
    ...(supplier ? { industryClassificationCode: new UdtCode('86909', { name: 'General Clinic Services' }) } : {}),
    partyIdentifications: [
      new PartyIdentification({
        id: tinScheme === null ? new UdtIdentifier(tin) : new UdtIdentifier(tin, { schemeID: tinScheme }),
      }),
    ],
    postalAddress: new PostalAddress({
      cityName: 'KUALA LUMPUR',
      countrySubentityCode: state,
      addressLines: [new AddressLine({ line: '1 Jalan Contoh' })],
      country: new Country({ identificationCode: new UdtCode(country, COUNTRY_CODE_ATTRIBUTES) }),
    }),
    partyLegalEntities: name ?? [new PartyLegalEntity({ registrationName: 'EXAMPLE CLINIC SDN. BHD.' })],
    contact: new Contact({ telephone: '+60312345678' }),
  });
}

interface Shape {
  buyerTin: string;
  state: string;
  country?: string;
  classification: string;
  lines?: number;
}

/** A complete, otherwise-valid invoice. */
function invoiceWith({ buyerTin, state, country = 'MYS', classification, lines = 1 }: Shape): Invoice {
  const invoice = new Invoice('INV-1');
  myInvois.defaults!(invoice);

  invoice
    .setIssueDate('2026-09-03')
    .setIssueTime('03:16:52Z')
    .setInvoiceTypeCode(DocumentTypeCode.Invoice, { listVersionID: DocumentVersion.Unsigned })
    .setDocumentCurrencyCode(CURRENCY);

  invoice.setAccountingSupplierParty(
    new AccountingSupplierParty({
      party: completeParty({ tin: 'C00000000000', state: '14', country: 'MYS', supplier: true }),
    }),
  );
  invoice.setAccountingCustomerParty(
    new AccountingCustomerParty({ party: completeParty({ tin: buyerTin, state, country }) }),
  );

  invoice.addTaxTotal(zeroRatedTax());
  invoice.setLegalMonetaryTotal(new LegalMonetaryTotal({ payableAmount: money('90.00') }));

  for (let index = 0; index < lines; index += 1) {
    invoice.addInvoiceLine(
      new InvoiceLine({
        id: String(index + 1),
        lineExtensionAmount: money('90.00'),
        taxTotals: [zeroRatedTax()],
        item: new Item({
          descriptions: [new UdtText('Consultation')],
          commodityClassification: [
            new CommodityClassification({
              itemClassificationCode: new UdtCode(classification, CLASSIFICATION_ATTRIBUTES),
            }),
          ],
        }),
        price: new Price({ priceAmount: money('90.00') }),
        itemPriceExtension: new ItemPriceExtension({ amount: money('90.00') }),
      }),
    );
  }

  return invoice;
}

const ordinary = (overrides: Partial<Shape> = {}) =>
  invoiceWith({ buyerTin: 'IG00000000000', state: '14', classification: '020', ...overrides });

const consolidated = (overrides: Partial<Shape> = {}) =>
  invoiceWith({ buyerTin: GENERAL_PUBLIC_TIN, state: '17', classification: '004', ...overrides });

const codes = (invoice: Invoice) => validateInvoice(invoice).issues.map((issue) => issue.code);
const parse = (path: string) => Invoice.fromXml(readFileSync(path, 'utf8'));

describe('MyInvois offline validation', () => {
  describe('documents LHDN has actually accepted', () => {
    it('passes the accepted production fixture', () => {
      expect(validateInvoice(parse(FIXTURE))).toStrictEqual({ valid: true, issues: [] });
    });

    it("passes LHDN's own published signed reference document", () => {
      // The strongest false-positive guard available offline and the only
      // document here this project did not author: a complete, signed, real
      // document written by the party doing the validating. It also exercises a
      // shape nothing else covers — a signed document carries ext:UBLExtensions
      // and a full ds:Signature tree, and no rule may fire on any of it.
      expect(validateInvoice(parse(SIGNED_SAMPLE))).toStrictEqual({ valid: true, issues: [] });
    });

    it('passes both shapes preprod accepted on 2026-09-03', () => {
      expect(validateInvoice(ordinary()).valid).toBe(true);
      expect(validateInvoice(consolidated()).valid).toBe(true);
    });
  });

  describe('the result', () => {
    it('reports a verdict alongside the detail, like LHDN does', () => {
      const result = validateInvoice(consolidated({ classification: '020' }));

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
    });

    it('is reachable from the profile without throwing', () => {
      expect(myInvois.validate(ordinary()).valid).toBe(true);
      expect(myInvois.validate(new Invoice('INV-1')).valid).toBe(false);
    });
  });

  describe('elements MyInvois requires at all', () => {
    it('rejects a document that is merely well-formed', () => {
      // Before presence checking, this passed: an Invoice with two TINs and
      // nothing else — no dates, no type code, no currency, no lines, no
      // totals — returned no issues at all.
      const result = validateInvoice(new Invoice('INV-1'));

      expect(result.valid).toBe(false);
      expect(result.issues.filter((issue) => issue.code === 'MYI004').length).toBeGreaterThan(5);
      expect(result.issues.map((issue) => issue.message)).toContain('the document is missing the issue date.');
    });

    it('names the line that is incomplete', () => {
      // cac:ItemPriceExtension is optional in UBL and required by MyInvois,
      // which is exactly the gap this validator exists to close — the type
      // system already refuses to build a line without lineExtensionAmount or
      // item, so those need no rule.
      const invoice = ordinary({ lines: 2 });
      invoice.addInvoiceLine(
        new InvoiceLine({
          id: '3',
          lineExtensionAmount: money('10.00'),
          taxTotals: [zeroRatedTax()],
          item: new Item({
            descriptions: [new UdtText('Dressing')],
            commodityClassification: [
              new CommodityClassification({ itemClassificationCode: new UdtCode('020', CLASSIFICATION_ATTRIBUTES) }),
            ],
          }),
          price: new Price({ priceAmount: money('10.00') }),
        }),
      );

      const [issue] = validateInvoice(invoice).issues;
      expect(issue.code).toBe('MYI004');
      expect(issue.message).toBe('invoice line 3 is missing the amount excluding tax.');
      expect(issue.path).toContain('cac:InvoiceLine[3]');
    });

    it('catches the empty element a plain object produces', () => {
      // The library's one silent failure: a plain object where a component
      // instance is required emits <cac:PartyLegalEntity/> rather than raising,
      // losing the name without a word. A presence rule that demands a non-empty
      // value is what turns that back into an error.
      const invoice = ordinary();
      invoice.setAccountingSupplierParty(
        new AccountingSupplierParty({
          party: completeParty({
            tin: 'C00000000000',
            state: '14',
            country: 'MYS',
            supplier: true,
            name: [{ registrationName: 'EXAMPLE' } as never],
          }),
        }),
      );

      expect(invoice.getXml(false, true)).toContain('<cac:PartyLegalEntity/>');
      expect(codes(invoice)).toStrictEqual(['MYI004']);
      expect(validateInvoice(invoice).issues[0].message).toBe('the supplier is missing the name.');
    });

    it('reports a missing element at a path a caller can search for', () => {
      // A missing element has no name to read, so the prefix comes from UBL's
      // own split: aggregates are cac, leaf values are cbc. Without it the path
      // would mix prefixed and bare segments and match nothing in the source.
      const invoice = ordinary();
      invoice.setAccountingCustomerParty(
        new AccountingCustomerParty({
          party: new Party({
            partyIdentifications: [
              new PartyIdentification({ id: new UdtIdentifier('IG00000000000', { schemeID: 'TIN' }) }),
            ],
          }),
        }),
      );

      expect(validateInvoice(invoice).issues.map((issue) => issue.path)).toContain(
        '/Invoice/cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CityName',
      );
    });

    it('does not complain twice about a party that is simply absent', () => {
      // "the document is missing the buyer" and "the buyer has no TIN" describe
      // one fault. Only the first is worth saying.
      const codesFor = codes(new Invoice('INV-1'));
      expect(codesFor.filter((code) => code === 'MYI002')).toStrictEqual([]);
    });

    it('does not require what LHDN models as optional', () => {
      // PostalZone, TaxCurrencyCode and InvoicedQuantity all appear in both
      // accepted documents, which is not the same as being required. Excluding
      // them is the same discipline that excluded unitCode.
      expect(validateInvoice(ordinary()).valid).toBe(true);
      expect(ordinary().getXml(false, true)).not.toContain('PostalZone');
      expect(ordinary().getXml(false, true)).not.toContain('InvoicedQuantity');
    });
  });

  describe('consolidated e-Invoice coherence', () => {
    // Nothing in the document declares it is consolidated: the General Public
    // buyer TIN decides it, and other fields must follow.
    it('does NOT require state code 17, whatever the buyer TIN is', () => {
      // 0.4.0 reported CV317 here, and LHDN disagrees. It accepted a document
      // with the General Public TIN, state code 14 and classification 004 —
      // `Step04-Code Field Validator: Valid`, which is the step that emits
      // CV317. The submitted bytes are on disk outside this repo, at
      // ubl-builder-test/oracle-output/260903182627-3.xml; they are not copied
      // in because they carry a real TIN and NRIC.
      expect(validateInvoice(consolidated({ state: '14' }))).toStrictEqual({ valid: true, issues: [] });
    });

    it('does not care about the state code on an ordinary invoice either', () => {
      // The reverse half of the removed rule — 17 on a Malaysian address that
      // is not consolidated — was never observed, only inferred from the
      // wording of LHDN's message. That message described a rule LHDN does not
      // appear to have.
      expect(validateInvoice(ordinary({ state: '17' })).valid).toBe(true);
      expect(validateInvoice(ordinary({ state: '17', country: 'SGP' })).valid).toBe(true);
    });

    it('requires classification 004 on every consolidated line', () => {
      const { issues } = validateInvoice(consolidated({ classification: '020', lines: 2 }));

      expect(issues.map((issue) => issue.code)).toStrictEqual(['MYI003', 'MYI003']);
      // Indexed, so a caller can find WHICH line is wrong.
      expect(issues.map((issue) => issue.path)).toStrictEqual([
        '/Invoice/cac:InvoiceLine[1]/cac:Item/cac:CommodityClassification/cbc:ItemClassificationCode',
        '/Invoice/cac:InvoiceLine[2]/cac:Item/cac:CommodityClassification/cbc:ItemClassificationCode',
      ]);
    });

    it('rejects classification 004 on an ordinary invoice — the one unobserved rule', () => {
      // Kept, but flagged: unlike the branch above, LHDN has never been seen to
      // reject this. It rests on the code list and on the constraint as stated,
      // which is the same standing the removed CV317 reverse half had. If a
      // valid document is ever refused, suspect this rule first.
      expect(codes(ordinary({ classification: '004' }))).toStrictEqual(['MYI003']);
    });
  });

  describe('attributes without which a value is ambiguous', () => {
    it('catches an amount passed as a bare string', () => {
      // The whole reason this validator exists: scalar params accept `string`
      // as shorthand, and a bare string carries no attributes. The result is
      // schema-valid and rejected on submission.
      const invoice = ordinary();
      invoice.setLegalMonetaryTotal(new LegalMonetaryTotal({ payableAmount: '90.00' }));

      const [issue] = validateInvoice(invoice).issues;
      expect(issue.code).toBe('MYI001');
      expect(issue.path).toBe('/Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount');
      expect(issue.message).toContain('@currencyID');
    });

    it('catches a party identifier with no schemeID', () => {
      const invoice = ordinary();
      invoice.setAccountingSupplierParty(
        new AccountingSupplierParty({
          party: completeParty({ tin: 'C00000000000', tinScheme: null, state: '14', country: 'MYS', supplier: true }),
        }),
      );

      // Both the missing attribute and the resulting absence of a TIN.
      expect(codes(invoice)).toStrictEqual(['MYI001', 'MYI002']);
    });

    it('catches a missing document version on InvoiceTypeCode', () => {
      // Load-bearing: it is how LHDN decides whether to run signature validation.
      const invoice = ordinary();
      invoice.setInvoiceTypeCode(DocumentTypeCode.Invoice);

      const [issue] = validateInvoice(invoice).issues;
      expect(issue.code).toBe('MYI001');
      expect(issue.message).toContain('@listVersionID');
    });

    it('reports an empty-string attribute as missing, because it never reaches the document', () => {
      // Worth pinning because the two layers disagree, and the disagreement is
      // invisible from the outside. `keepAttribute` in xmlNode.ts deliberately
      // WRITES an empty attribute — XMLDSig's `URI=""` depends on it — but the
      // Udt constructor drops one before a node is ever built, so
      // `currencyID: ''` yields `attributes: {}` here.
      //
      // Nothing is broken: signing builds its elements directly rather than
      // through Udt classes, so `URI=""` is unaffected. And the outcome is the
      // one a caller wants either way, since an amount carrying `currencyID=""`
      // has no currency any more than one carrying nothing.
      const invoice = ordinary();
      invoice.setLegalMonetaryTotal(
        new LegalMonetaryTotal({ payableAmount: new UdtAmount('90.00', { currencyID: '' }) }),
      );

      expect(codes(invoice)).toStrictEqual(['MYI001']);
    });
  });

  describe('reporting', () => {
    it('reports every issue at once, not the first', () => {
      // A direct lesson from the live API. LHDN returned ERR205 against the
      // buyer's PartyIdentification for a document whose faults were in the
      // postal address and the classification code — a field that was never
      // wrong. Fixing one reported error at a time converges slowly or not at
      // all, so a caller gets the whole set.
      const invoice = consolidated({ classification: '020', lines: 2 });
      invoice.setInvoiceTypeCode(DocumentTypeCode.Invoice);

      expect(codes(invoice)).toStrictEqual(['MYI001', 'MYI003', 'MYI003']);
    });

    it('carries the issues on the thrown error', () => {
      let caught: MyInvoisValidationError | undefined;
      try {
        myInvois.finalize!(consolidated({ classification: '020' }));
      } catch (error) {
        caught = error as MyInvoisValidationError;
      }

      expect(caught).toBeInstanceOf(MyInvoisValidationError);
      expect(caught?.issues.map((issue) => issue.code)).toStrictEqual(['MYI003']);
      // The message alone has to be usable, since that is what an uncaught
      // throw prints.
      expect(caught?.message).toContain('MYI003');
      expect(caught?.message).toContain('cbc:ItemClassificationCode');
    });
  });
});
