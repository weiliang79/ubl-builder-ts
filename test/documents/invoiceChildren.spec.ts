import {
  BuyerCustomerParty,
  Party,
  PartyLegalEntity,
  PayeeParty,
  PaymentAlternativeExchangeRate,
  PaymentTerms,
  PricingExchangeRate,
  SellerSupplierParty,
  TaxExchangeRate,
  WithholdingTaxTotal,
} from '../../src/cac';
import { Invoice } from '../../src/documents';
import { INVOICE_CHILDREN_MAP } from '../../src/documents/ChildrenMap';

/**
 * Eight of the 54 children in INVOICE_CHILDREN_MAP had no implementation: the
 * setter existed and threw `not implemented`, so toNode() would have serialised
 * the element and nothing could put one there. cac:PaymentTerms and
 * cac:PayeeParty are ordinary on a commercial invoice, and
 * cac:WithholdingTaxTotal is what MyInvois uses for withholding.
 *
 * They are also what a parser has to assign into: a round trip cannot preserve
 * a child the document has no way to hold.
 */
describe('Invoice children that had no setter', () => {
  const legal = (name: string) => [new PartyLegalEntity({ registrationName: name })];
  const rate = (value: string) => ({ sourceCurrencyCode: 'USD', targetCurrencyCode: 'MYR', calculationRate: value });

  const build = (): Invoice =>
    new Invoice('INV-1')
      .setPayeeParty(new PayeeParty({ partyLegalEntities: legal('Payee') }))
      .setBuyerCustomerParty(new BuyerCustomerParty({ party: new Party({ partyLegalEntities: legal('Buyer') }) }))
      .setSellerSupplierParty(new SellerSupplierParty({ party: new Party({ partyLegalEntities: legal('Seller') }) }))
      .addPaymentTerm(new PaymentTerms({ notes: ['net 30'] }))
      .addPaymentTerm(new PaymentTerms({ notes: ['2/10'] }))
      .setTaxExchangeRate(new TaxExchangeRate(rate('4.7')))
      .setPricingExchangeRate(new PricingExchangeRate(rate('4.8')))
      .setPaymentAlternativeExchangeRate(new PaymentAlternativeExchangeRate(rate('4.9')))
      .addWithholdingTaxTotal(new WithholdingTaxTotal({ taxAmount: '1.00' }));

  const elements = [
    'cac:PayeeParty',
    'cac:BuyerCustomerParty',
    'cac:SellerSupplierParty',
    'cac:PaymentTerms',
    'cac:TaxExchangeRate',
    'cac:PricingExchangeRate',
    'cac:PaymentAlternativeExchangeRate',
    'cac:WithholdingTaxTotal',
  ];

  it.each(elements)('emits %s', (element) => {
    expect(build().getXml(false, true)).toContain(`<${element}>`);
  });

  it('repeats the children UBL marks unbounded', () => {
    // cac:PaymentTerms is 0..* on InvoiceType, so a second call adds rather
    // than replaces. The map decides that, not the setter.
    expect(INVOICE_CHILDREN_MAP.paymentTerms.max).toBeUndefined();
    expect(
      build()
        .getXml(false, true)
        .match(/<cac:PaymentTerms>/g),
    ).toHaveLength(2);
  });

  it('places them where the schema sequence puts them', () => {
    const xml = build().getXml(false, true);
    const seen = xml.match(new RegExp(`<(${elements.join('|')})>`, 'g')) ?? [];

    expect(seen).toEqual([
      '<cac:PayeeParty>',
      '<cac:BuyerCustomerParty>',
      '<cac:SellerSupplierParty>',
      '<cac:PaymentTerms>',
      '<cac:PaymentTerms>',
      '<cac:TaxExchangeRate>',
      '<cac:PricingExchangeRate>',
      '<cac:PaymentAlternativeExchangeRate>',
      '<cac:WithholdingTaxTotal>',
    ]);
  });

  it('names a class for every child the document map declares', () => {
    // What the parser reads. Before this branch the mapping lived only inside
    // the setters, so nothing could look up what a child should become.
    const keys = Object.keys(INVOICE_CHILDREN_MAP);
    expect(keys).toHaveLength(54);
    expect(keys.filter((k) => typeof INVOICE_CHILDREN_MAP[k].classRef !== 'function')).toEqual([]);
  });
});
