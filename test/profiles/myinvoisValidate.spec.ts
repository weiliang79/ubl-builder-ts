import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AccountingCustomerParty,
  AccountingSupplierParty,
  CommodityClassification,
  Country,
  InvoiceLine,
  Item,
  LegalMonetaryTotal,
  Party,
  PartyIdentification,
  PartyLegalEntity,
  PostalAddress,
  Price,
} from '../../src/cac';
import { UdtAmount, UdtCode, UdtIdentifier, UdtQuantity, UdtText } from '../../src/datatypes/udt';
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
  validateInvoice,
} from '../../src/profiles/myinvois';

/**
 * The offline MyInvois rules.
 *
 * Two of these are not inferred from documentation: `CV317` and the
 * consolidated classification code were both learned by having LHDN's preprod
 * API reject a real submission on 2026-09-03, and the shapes asserted below are
 * the ones it then accepted.
 *
 * The most important test in this file is the first one. A validator's real
 * risk is not that it misses something — it is that it blocks a document LHDN
 * would have accepted, because the only workaround for that is to stop using
 * it. Both accepted shapes are therefore pinned as passing before any rule is
 * tested for firing.
 */

const FIXTURE = join(__dirname, '..', 'fixtures', 'myinvois-invoice.xml');
const CURRENCY = 'MYR';

const money = (value: string) => new UdtAmount(value, { currencyID: CURRENCY });
const identity = (value: string, schemeID: string) =>
  new PartyIdentification({ id: new UdtIdentifier(value, { schemeID }) });

interface Shape {
  buyerTin: string;
  state: string;
  country?: string;
  classification: string;
  lines?: number;
}

/** A complete, otherwise-valid invoice, varied only where a test needs it. */
function invoiceWith({ buyerTin, state, country = 'MYS', classification, lines = 1 }: Shape): Invoice {
  const invoice = new Invoice('INV-1');
  myInvois.defaults!(invoice);

  invoice
    .setIssueDate('2026-09-03')
    .setIssueTime('03:16:52Z')
    .setInvoiceTypeCode(DocumentTypeCode.Invoice, { listVersionID: DocumentVersion.Unsigned })
    .setDocumentCurrencyCode(CURRENCY);

  const address = (line: string) =>
    new PostalAddress({
      cityName: 'KUALA LUMPUR',
      postalZone: '50000',
      countrySubentityCode: state,
      country: new Country({ identificationCode: new UdtCode(country, COUNTRY_CODE_ATTRIBUTES) }),
      addressLines: [{ line }] as never,
    });

  invoice.setAccountingSupplierParty(
    new AccountingSupplierParty({
      party: new Party({
        partyIdentifications: [identity('C00000000000', IdentificationScheme.Tin)],
        postalAddress: address('1 Jalan Contoh'),
        partyLegalEntities: [new PartyLegalEntity({ registrationName: 'EXAMPLE CLINIC SDN. BHD.' })],
      }),
    }),
  );

  invoice.setAccountingCustomerParty(
    new AccountingCustomerParty({
      party: new Party({
        partyIdentifications: [identity(buyerTin, IdentificationScheme.Tin)],
        postalAddress: address('2 Jalan Contoh'),
        partyLegalEntities: [new PartyLegalEntity({ registrationName: 'General Public' })],
      }),
    }),
  );

  invoice.setLegalMonetaryTotal(new LegalMonetaryTotal({ payableAmount: money('90.00') }));

  for (let index = 0; index < lines; index += 1) {
    invoice.addInvoiceLine(
      new InvoiceLine({
        id: String(index + 1),
        invoicedQuantity: new UdtQuantity('1.00', { unitCode: 'XUN' }),
        lineExtensionAmount: money('90.00'),
        item: new Item({
          descriptions: [new UdtText('Consultation')],
          commodityClassification: [
            new CommodityClassification({
              itemClassificationCode: new UdtCode(classification, CLASSIFICATION_ATTRIBUTES),
            }),
          ],
        }),
        price: new Price({ priceAmount: money('90.00') }),
      }),
    );
  }

  return invoice;
}

const ordinary = (overrides: Partial<Shape> = {}) =>
  invoiceWith({ buyerTin: 'IG00000000000', state: '14', classification: '020', ...overrides });

const consolidated = (overrides: Partial<Shape> = {}) =>
  invoiceWith({ buyerTin: GENERAL_PUBLIC_TIN, state: '17', classification: '004', ...overrides });

const codes = (invoice: Invoice) => validateInvoice(invoice).map((issue) => issue.code);

describe('MyInvois offline validation', () => {
  describe('documents LHDN has actually accepted', () => {
    it('passes the accepted production fixture', () => {
      expect(validateInvoice(Invoice.fromXml(readFileSync(FIXTURE, 'utf8')))).toStrictEqual([]);
    });

    it("passes LHDN's own published signed reference document", () => {
      // The strongest false-positive guard available offline, and the only one
      // this project did not author: a complete, signed, real document written
      // by the party doing the validating. It also exercises a shape nothing
      // else here does — a signed document carries ext:UBLExtensions and a
      // ds:Signature tree, and no rule may fire on any of it.
      const signed = join(__dirname, '..', 'fixtures', 'lhdn', 'one-doc-signed.xml');
      expect(validateInvoice(Invoice.fromXml(readFileSync(signed, 'utf8')))).toStrictEqual([]);
    });

    it('passes an ordinary invoice', () => {
      expect(validateInvoice(ordinary())).toStrictEqual([]);
    });

    it('passes a consolidated invoice in the shape preprod accepted on 2026-09-03', () => {
      expect(validateInvoice(consolidated())).toStrictEqual([]);
    });
  });

  describe('consolidated e-Invoice coherence', () => {
    // Nothing in the document declares it is consolidated: the General Public
    // buyer TIN decides it, and other fields must follow.
    it('requires state code 17 when the buyer is General Public', () => {
      const [issue, ...rest] = validateInvoice(consolidated({ state: '14' }));

      expect(issue.code).toBe('CV317');
      expect(issue.expected).toBe('17');
      expect(issue.actual).toBe('14');
      expect(issue.path).toBe(
        '/Invoice/cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CountrySubentityCode',
      );
      expect(rest).toStrictEqual([]);
    });

    it('rejects state code 17 on an ordinary Malaysian address', () => {
      // The other half of LHDN's rule: "17 should be used for Consolidated
      // e-Invoice and non-Malaysian address only".
      expect(codes(ordinary({ state: '17' }))).toStrictEqual(['CV317']);
    });

    it('allows state code 17 on a non-Malaysian address', () => {
      expect(validateInvoice(ordinary({ state: '17', country: 'SGP' }))).toStrictEqual([]);
    });

    it('requires classification 004 on every consolidated line', () => {
      const issues = validateInvoice(consolidated({ classification: '020', lines: 2 }));

      expect(issues.map((issue) => issue.code)).toStrictEqual(['MYI003', 'MYI003']);
      // Indexed, so a caller can find WHICH line is wrong.
      expect(issues.map((issue) => issue.path)).toStrictEqual([
        '/Invoice/cac:InvoiceLine[1]/cac:Item/cac:CommodityClassification/cbc:ItemClassificationCode',
        '/Invoice/cac:InvoiceLine[2]/cac:Item/cac:CommodityClassification/cbc:ItemClassificationCode',
      ]);
    });

    it('rejects classification 004 on an ordinary invoice', () => {
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

      const [issue] = validateInvoice(invoice);
      expect(issue.code).toBe('MYI001');
      expect(issue.path).toBe('/Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount');
      expect(issue.message).toContain('@currencyID');
    });

    it('catches a party identifier with no schemeID', () => {
      const invoice = ordinary();
      invoice.setAccountingSupplierParty(
        new AccountingSupplierParty({
          party: new Party({ partyIdentifications: [new PartyIdentification({ id: 'C00000000000' })] }),
        }),
      );

      // Both the missing attribute and the resulting absence of a TIN.
      expect(codes(invoice)).toStrictEqual(['MYI001', 'MYI002']);
    });

    it('catches a missing document version on InvoiceTypeCode', () => {
      // Load-bearing: it is how LHDN decides whether to run signature validation.
      const invoice = ordinary();
      invoice.setInvoiceTypeCode(DocumentTypeCode.Invoice);

      const [issue] = validateInvoice(invoice);
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
      const invoice = consolidated({ state: '14', classification: '020', lines: 2 });

      expect(codes(invoice)).toStrictEqual(['CV317', 'MYI003', 'MYI003']);
    });

    it('carries the issues on the thrown error', () => {
      let caught: MyInvoisValidationError | undefined;
      try {
        myInvois.finalize!(consolidated({ state: '14' }));
      } catch (error) {
        caught = error as MyInvoisValidationError;
      }

      expect(caught).toBeInstanceOf(MyInvoisValidationError);
      expect(caught?.issues.map((issue) => issue.code)).toStrictEqual(['CV317']);
      // The message alone has to be usable, since that is what an uncaught
      // throw prints.
      expect(caught?.message).toContain('CV317');
      expect(caught?.message).toContain('cbc:CountrySubentityCode');
    });
  });
});
