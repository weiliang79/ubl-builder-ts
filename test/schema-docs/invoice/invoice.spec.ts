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
  TaxScheme,
  TaxSubtotal,
  TaxTotal,
} from '../../../src/cac';
import { CommodityClassification } from '../../../src/cac/CommodityClassification';
import { ItemPriceExtension } from '../../../src/cac/ItemPriceExtension';
import { UdtAmount, UdtCode, UdtIdentifier, UdtQuantity, UdtText } from '../../../src/datatypes/udt';
import { Invoice } from '../../../src/documents';

describe('Invoice', () => {
  it('should construct a simple invoice XML document', () => {
    const invoice = new Invoice();

    // Set document properties
    invoice.addProperty('xmlns', 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2');
    invoice.addProperty('xmlns:cac', 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2');
    invoice.addProperty('xmlns:cbc', 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2');

    // Set document elements
    invoice.setID('12345');
    invoice.setIssueDate('2025-01-01');
    invoice.setIssueTime('00:00:00Z');

    const xml = invoice.getXml(false, true);
    expect(xml).toStrictEqual(
      `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"><cbc:ID>12345</cbc:ID><cbc:IssueDate>2025-01-01</cbc:IssueDate><cbc:IssueTime>00:00:00Z</cbc:IssueTime></Invoice>`,
    );
  });

  it('should construct a complex invoice XML document', () => {
    const invoice = new Invoice();

    // Set document properties
    invoice.addProperty('xmlns', 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2');
    invoice.addProperty('xmlns:cac', 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2');
    invoice.addProperty('xmlns:cbc', 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2');

    // Set document elements
    invoice
      .setID('INV12345')
      .setIssueDate('2025-09-18')
      .setIssueTime('16:00:00Z')
      .setInvoiceTypeCode('01', {
        listVersionID: '1.0',
      })
      .setDocumentCurrencyCode('MYR')
      .setTaxCurrencyCode('MYR');

    // Set billing reference
    // invoice
    //   .addBillingReference({
    //     additionalDocumentReference: new AdditionalDocumentReference({
    //       id: '67890',
    //     }),
    //   })
    //   .addAdditionalDocumentReference({
    //     id: 'L1',
    //     documentType: 'CustomsImportForm',
    //   })
    //   .addAdditionalDocumentReference({
    //     id: 'FTA',
    //     documentType: 'FreeTradeAgreement',
    //     documentDescription: 'Sample Description',
    //   });

    // Set document supplier party
    const supplier = new Party({
      industryClassificationCode: new UdtCode('46510', {
        name: 'Wholesale of computer hardware, software and peripherals',
      }),
      postalAddress: new PostalAddress({
        cityName: 'Pulau Pinang',
        postalZone: '11700',
        countrySubentityCode: '07',
        addressLines: [
          new AddressLine({ line: 'The Summit Batu Pahat 88 Jalan Bakau Condong' }),
          new AddressLine({ line: 'Batu Pahat' }),
        ],
        country: new Country({
          identificationCode: new UdtCode('MYS', { listID: 'ISO3166-1', listAgencyID: '6' }),
        }),
      }),
      partyLegalEntities: [
        new PartyLegalEntity({
          registrationName: 'Sample Company',
        }),
      ],
      contact: new Contact({
        name: 'Wei Liang',
        telephone: '+60123456789',
        electronicMail: '3K4oJ@example.com',
      }),
    });

    supplier
      .addPartyIdentification({
        id: new UdtIdentifier('IG10024460070', {
          schemeID: 'TIN',
        }),
      })
      .addPartyIdentification({
        id: new UdtIdentifier('000131071234', {
          schemeID: 'NRIC',
        }),
      })
      .addPartyIdentification({
        id: new UdtIdentifier('NA', {
          schemeID: 'SST',
        }),
      })
      .addPartyIdentification({
        id: new UdtIdentifier('NA', {
          schemeID: 'TTX',
        }),
      });

    invoice.setAccountingSupplierParty(
      new AccountingSupplierParty({
        party: supplier,
      }),
    );

    // Set document customer party
    const customer = new Party({
      postalAddress: new PostalAddress({
        cityName: 'Pulau Pinang',
        postalZone: '11700',
        countrySubentityCode: '07',
        addressLines: [
          new AddressLine({ line: 'The Summit Batu Pahat 88 Jalan Bakau Condong' }),
          new AddressLine({ line: 'Batu Pahat' }),
        ],
        country: new Country({
          identificationCode: new UdtCode('MYS', { listID: 'ISO3166-1', listAgencyID: '6' }),
        }),
      }),
      partyLegalEntities: [
        new PartyLegalEntity({
          registrationName: 'Sample Company',
        }),
      ],
      contact: new Contact({
        name: 'Wei Liang',
        telephone: '+60123456789',
        electronicMail: '3K4oJ@example.com',
      }),
    });

    customer
      .addPartyIdentification({
        id: new UdtIdentifier('IG10024460070', {
          schemeID: 'TIN',
        }),
      })
      .addPartyIdentification({
        id: new UdtIdentifier('000131071234', {
          schemeID: 'NRIC',
        }),
      })
      .addPartyIdentification({
        id: new UdtIdentifier('NA', {
          schemeID: 'SST',
        }),
      })
      .addPartyIdentification({
        id: new UdtIdentifier('NA', {
          schemeID: 'TTX',
        }),
      });

    invoice.setAccountingCustomerParty(
      new AccountingCustomerParty({
        party: customer,
      }),
    );

    // Add Tax Total
    invoice.addTaxTotal(
      new TaxTotal({
        taxAmount: new UdtAmount('0', {
          currencyID: 'MYR',
        }),
        taxSubtotals: [
          new TaxSubtotal({
            taxableAmount: new UdtAmount('0', {
              currencyID: 'MYR',
            }),
            taxAmount: new UdtAmount('0', {
              currencyID: 'MYR',
            }),
            taxCategory: new TaxCategory({
              id: '06',
              taxScheme: new TaxScheme({
                id: new UdtIdentifier('OTH', {
                  schemeID: 'UN/ECE 5153',
                  schemeAgencyID: '6',
                }),
              }),
            }),
          }),
        ],
      }),
    );

    // Add Legal Monetary Total
    invoice.setLegalMonetaryTotal({
      taxExclusiveAmount: new UdtAmount('100', {
        currencyID: 'MYR',
      }),
      taxInclusiveAmount: new UdtAmount('100', {
        currencyID: 'MYR',
      }),
      payableAmount: new UdtAmount('100', {
        currencyID: 'MYR',
      }),
    });

    // Add Invoice line item
    invoice.addInvoiceLine({
      id: '1',
      invoicedQuantity: new UdtQuantity('1', {
        unitCode: 'C62',
      }),
      lineExtensionAmount: new UdtAmount('100', {
        currencyID: 'MYR',
      }),
      taxTotals: [
        new TaxTotal({
          taxAmount: new UdtAmount('0', {
            currencyID: 'MYR',
          }),
          taxSubtotals: [
            new TaxSubtotal({
              taxableAmount: new UdtAmount('0', {
                currencyID: 'MYR',
              }),
              taxAmount: new UdtAmount('0', {
                currencyID: 'MYR',
              }),
              taxCategory: new TaxCategory({
                id: '06',
                taxScheme: new TaxScheme({
                  id: new UdtIdentifier('OTH', {
                    schemeID: 'UN/ECE 5153',
                    schemeAgencyID: '6',
                  }),
                }),
              }),
            }),
          ],
        }),
      ],
      item: new Item({
        descriptions: [new UdtText('Sample Item')],
        commodityClassification: [
          new CommodityClassification({
            itemClassificationCode: new UdtCode('019', {
              listID: 'CLASS',
            }),
          }),
        ],
      }),
      price: new Price({
        priceAmount: new UdtAmount('100', {
          currencyID: 'MYR',
        }),
      }),
      itemPriceExtension: new ItemPriceExtension({
        amount: new UdtAmount('100', { currencyID: 'MYR' }),
      }),
    });

    const xml = invoice.getXml(true, true);

    console.log(xml);

    expect(xml).toEqual(expect.any(String));
  });
});
