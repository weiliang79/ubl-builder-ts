import {
  AccountingCustomerParty,
  AccountingSupplierParty,
  AddressLine,
  Contact,
  Country,
  Item,
  Party,
  PartyLegalEntity,
  PostalAddress,
  Price,
  TaxCategory,
  TaxSubtotal,
  TaxTotal,
} from '../../src/cac';
import { CommodityClassification } from '../../src/cac/CommodityClassification';
import { ItemPriceExtension } from '../../src/cac/ItemPriceExtension';
import { UdtAmount, UdtCode, UdtIdentifier, UdtPercent, UdtQuantity, UdtText } from '../../src/datatypes/udt';
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
 * Reproduces the element structure of a MyInvois v1.0 invoice that LHDN
 * accepted in production (status "Valid"), with every identifying value
 * replaced by a synthetic one.
 *
 * The shape — element sequence, attributes, cardinality — is verbatim from
 * that document. Only the data is invented.
 */
export function buildMyInvoisInvoice(): Invoice {
  const CURRENCY = 'MYR';
  const money = (v: string) => new UdtAmount(v, { currencyID: CURRENCY });
  const invoice = new Invoice();

  myInvois.defaults!(invoice);

  invoice
    .setID('INV-0000-00001')
    .setIssueDate('2026-07-02')
    .setIssueTime('02:02:36Z')
    .setInvoiceTypeCode(DocumentTypeCode.Invoice, { listVersionID: DocumentVersion.Unsigned })
    .setDocumentCurrencyCode(CURRENCY)
    .setTaxCurrencyCode(CURRENCY);

  invoice.addInvoicePeriod({
    startDate: '2026-06-08',
    startTime: '02:20:02Z',
    endDate: '2026-06-08',
    endTime: '02:20:02Z',
  });

  const supplier = new Party({
    industryClassificationCode: new UdtCode('86909', { name: 'EXAMPLE MEDICAL SERVICES' }),
    postalAddress: new PostalAddress({
      cityName: 'KUALA LUMPUR',
      postalZone: '50000',
      countrySubentityCode: '14',
      addressLines: [new AddressLine({ line: '1 Jalan Contoh' })],
      country: new Country({
        identificationCode: new UdtCode('MYS', COUNTRY_CODE_ATTRIBUTES),
      }),
    }),
    partyLegalEntities: [new PartyLegalEntity({ registrationName: 'EXAMPLE CLINIC SDN. BHD.' })],
    contact: new Contact({ name: 'EXAMPLE CLINIC SDN. BHD.', telephone: '+60312345678' }),
  });

  supplier
    .addPartyIdentification({ id: new UdtIdentifier('C00000000000', { schemeID: IdentificationScheme.Tin }) })
    .addPartyIdentification({
      id: new UdtIdentifier('000000000000', { schemeID: IdentificationScheme.BusinessRegistration }),
    })
    .addPartyIdentification({ id: new UdtIdentifier('NA', { schemeID: IdentificationScheme.SalesTax }) })
    .addPartyIdentification({ id: new UdtIdentifier('NA', { schemeID: IdentificationScheme.TourismTax }) });

  const customer = new Party({
    postalAddress: new PostalAddress({
      cityName: 'KUALA LUMPUR',
      postalZone: '50000',
      countrySubentityCode: '14',
      addressLines: [new AddressLine({ line: '2 Jalan Contoh' }), new AddressLine({ line: 'Taman Contoh' })],
      country: new Country({
        identificationCode: new UdtCode('MYS', COUNTRY_CODE_ATTRIBUTES),
      }),
    }),
    partyLegalEntities: [new PartyLegalEntity({ registrationName: 'EXAMPLE BUYER' })],
    contact: new Contact({ name: 'EXAMPLE BUYER', telephone: '+60312345679' }),
  });

  customer
    .addPartyIdentification({ id: new UdtIdentifier('IG00000000000', { schemeID: IdentificationScheme.Tin }) })
    .addPartyIdentification({ id: new UdtIdentifier('000000000000', { schemeID: IdentificationScheme.Nric }) })
    .addPartyIdentification({ id: new UdtIdentifier('NA', { schemeID: IdentificationScheme.SalesTax }) })
    .addPartyIdentification({ id: new UdtIdentifier('NA', { schemeID: IdentificationScheme.TourismTax }) });

  invoice.setAccountingSupplierParty(new AccountingSupplierParty({ party: supplier }));
  invoice.setAccountingCustomerParty(new AccountingCustomerParty({ party: customer }));

  invoice.addTaxTotal(
    new TaxTotal({
      taxAmount: money('0.00'),
      taxSubtotals: [
        new TaxSubtotal({
          taxableAmount: money('0.00'),
          taxAmount: money('0.00'),
          taxCategory: new TaxCategory({ id: TaxCategoryCode.NotApplicable, taxScheme: otherTaxScheme() }),
        }),
      ],
    }),
  );

  invoice.setLegalMonetaryTotal({
    lineExtensionAmount: money('90.00'),
    taxExclusiveAmount: money('90.00'),
    taxInclusiveAmount: money('90.00'),
    payableAmount: money('90.00'),
  });

  invoice.addInvoiceLine({
    id: '1',
    invoicedQuantity: new UdtQuantity('60.00', { unitCode: 'XUN' }),
    lineExtensionAmount: money('90.00'),
    taxTotals: [
      new TaxTotal({
        taxAmount: money('0.00'),
        taxSubtotals: [
          new TaxSubtotal({
            taxAmount: money('0.00'),
            percent: new UdtPercent('0.00'),
            taxCategory: new TaxCategory({ id: TaxCategoryCode.NotApplicable, taxScheme: otherTaxScheme() }),
          }),
        ],
      }),
    ],
    item: new Item({
      descriptions: [new UdtText('Consultation')],
      commodityClassification: [
        new CommodityClassification({
          itemClassificationCode: new UdtCode('020', CLASSIFICATION_ATTRIBUTES),
        }),
      ],
    }),
    price: new Price({ priceAmount: money('1.50') }),
    itemPriceExtension: new ItemPriceExtension({ amount: money('90.00') }),
  });

  return invoice;
}
