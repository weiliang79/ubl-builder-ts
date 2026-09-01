import { DespatchDocumentReference, PostalAddress } from '../../src/cac';
import { AllowanceCharge } from '../../src/cac/AllowanceCharge';
import { Attachment } from '../../src/cac/Attachment';
import { Delivery } from '../../src/cac/Delivery';
import { DeliveryTerms } from '../../src/cac/DeliveryTerms';
import { ExternalReference } from '../../src/cac/ExternalReference';
import { PaymentTerms } from '../../src/cac/PaymentTerms';
import { ValidityPeriod } from '../../src/cac/Period';
import { UdtIdentifier, UdtName, UdtPercent } from '../../src/datatypes/udt';

/**
 * A params-map entry's `classRef` decides what a raw value gets wrapped in, and
 * until check:classref nothing compared it to the schema. Two ways it goes
 * wrong, one example of each kept here because both were live.
 *
 * The gate catches a recurrence mechanically; these record what the defect
 * actually did, which a rule about metadata cannot.
 */
describe('classRef agrees with the schema', () => {
  it('keeps the content of an aggregate child', () => {
    // cac:DeliveryTerms is an aggregate and was wired to UdtDate, so the
    // component was rebuilt as a date and serialised as an empty element:
    // <cac:Delivery><cac:DeliveryTerms></cac:DeliveryTerms></cac:Delivery>
    const delivery = new Delivery({ deliveryTerms: [new DeliveryTerms({ id: 'DT-1' })] });

    expect(delivery.getAsXml(false, true, 'cac:Delivery')).toBe(
      '<cac:Delivery><cac:DeliveryTerms><cbc:ID>DT-1</cbc:ID></cac:DeliveryTerms></cac:Delivery>',
    );
  });

  it('wraps a datatype child in the type the schema names', () => {
    // cbc:SettlementDiscountPercent is a PercentType and was wired to UdtCode,
    // whose attributes — listID, listAgencyID — the XSD forbids there. The
    // element still carried its text, so nothing failed until validation.
    // PaymentTerms also had `constructor(content: string)`, so the only call
    // its signature allowed threw and every real one needed a cast.
    const terms = new PaymentTerms({ settlementDiscountPercent: new UdtPercent('2.5') });

    expect(terms.getAsXml(false, true, 'cac:PaymentTerms')).toBe(
      '<cac:PaymentTerms><cbc:SettlementDiscountPercent>2.5</cbc:SettlementDiscountPercent></cac:PaymentTerms>',
    );
  });

  it('accepts the attributes the schema does allow', () => {
    // NameType carries languageID, and cbc:StreetName is a NameType. The point
    // of the correction is the right attribute set, not a narrower one.
    const address = new PostalAddress({ streetName: new UdtName('Main Street', { languageID: 'en' }) });

    expect(address.getAsXml(false, true, 'cac:PostalAddress')).toBe(
      '<cac:PostalAddress><cbc:StreetName languageID="en">Main Street</cbc:StreetName></cac:PostalAddress>',
    );
  });

  it('accepts the aggregate its entry actually builds', () => {
    // cac:Attachment and cac:ValidityPeriod were declared `string` against
    // entries that wrap in Attachment and ValidityPeriod, so the only value
    // either type accepted was built as a component out of a string and threw
    // "attribute 0 is not allowed". Neither was usable at all.
    const ref = new DespatchDocumentReference({
      id: new UdtIdentifier('D1', { schemeID: 'DN' }),
      attachment: new Attachment({ externalReference: new ExternalReference({ URI: 'https://example.test/a.pdf' }) }),
      validityPeriod: new ValidityPeriod({ startDate: '2026-01-01' }),
    });

    expect(ref.getAsXml(false, true, 'cac:DespatchDocumentReference')).toBe(
      '<cac:DespatchDocumentReference>' +
        '<cbc:ID schemeID="DN">D1</cbc:ID>' +
        '<cac:Attachment><cac:ExternalReference><cbc:URI>https://example.test/a.pdf</cbc:URI></cac:ExternalReference></cac:Attachment>' +
        '<cac:ValidityPeriod><cbc:StartDate>2026-01-01</cbc:StartDate></cac:ValidityPeriod>' +
        '</cac:DespatchDocumentReference>',
    );
  });

  it('still takes a plain string, which is how most values arrive', () => {
    const charge = new AllowanceCharge({ chargeIndicator: false, amount: '1.00', multiplierFactorNumeric: '0.25' });

    expect(charge.getAsXml(false, true, 'cac:AllowanceCharge')).toBe(
      '<cac:AllowanceCharge>' +
        '<cbc:ChargeIndicator>false</cbc:ChargeIndicator>' +
        '<cbc:MultiplierFactorNumeric>0.25</cbc:MultiplierFactorNumeric>' +
        '<cbc:Amount>1.00</cbc:Amount>' +
        '</cac:AllowanceCharge>',
    );
  });
});
