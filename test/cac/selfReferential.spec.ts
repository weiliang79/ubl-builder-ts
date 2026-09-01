import {
  AlternativeDeliveryLocation,
  CreditNoteLine,
  DebitNoteLine,
  InvoiceLine,
  Item,
  Party,
  PriceList,
} from '../../src/cac';

/**
 * Six UBL types contain themselves: a Party has an AgentParty, a Location has
 * SubsidiaryLocations, an InvoiceLine has SubInvoiceLines, and so on. Their
 * params maps must reference the class the file is still in the middle of
 * declaring, which only works through a lazy `classRef: () => X` resolved on
 * first use.
 *
 * Nothing else can catch a mistake here. TypeScript is satisfied either way —
 * the binding exists at type level regardless — and the schema and params-map
 * gates only compare metadata. An eager reference, or one naming an export
 * alias rather than the declared class, fails at runtime and only when someone
 * actually sets the child.
 *
 * These construct with no casts, which is itself the assertion: until the
 * AllowedParams optionality was aligned with the schema, five of the six host
 * types demanded fields UBL marks optional — CreditNoteLine wanted 23 and
 * DebitNoteLine 17 — so most of these children could not be set from typed
 * code at all. The `id` and `lineExtensionAmount` supplied below are the ones
 * UBL really does mark minOccurs="1".
 */
describe('self-referential children', () => {
  it('nests a Party inside a Party through cac:AgentParty', () => {
    const party = new Party({ agentParty: new Party({}) });
    expect(party.parseToJson()['cac:AgentParty']).toBeDefined();
  });

  it('nests a CreditNoteLine inside a CreditNoteLine', () => {
    const line = new CreditNoteLine({ id: '1', subCreditNoteLines: [new CreditNoteLine({ id: '2' })] });
    expect(line.parseToJson()['cac:SubCreditNoteLine']).toHaveLength(1);
  });

  it('nests a PriceList inside a PriceList', () => {
    const list = new PriceList({ previousPriceList: new PriceList({}) });
    expect(list.parseToJson()['cac:PreviousPriceList']).toBeDefined();
  });

  it('nests a Location inside a Location, reached through an export alias', () => {
    const location = new AlternativeDeliveryLocation({
      subsidiaryLocations: [new AlternativeDeliveryLocation({})],
    });
    expect(location.parseToJson()['cac:SubsidiaryLocation']).toHaveLength(1);
  });

  it('nests an InvoiceLine inside an InvoiceLine', () => {
    // id, lineExtensionAmount and item are minOccurs="1" on InvoiceLineType,
    // so supplying them is the schema being enforced rather than a workaround.
    const inner = new InvoiceLine({ id: '2', lineExtensionAmount: '10.00', item: new Item({}) });
    const line = new InvoiceLine({
      id: '1',
      lineExtensionAmount: '10.00',
      item: new Item({}),
      subInvoiceLines: [inner],
    });
    expect(line.parseToJson()['cac:SubInvoiceLine']).toHaveLength(1);
  });

  it('nests a DebitNoteLine inside a DebitNoteLine', () => {
    const inner = new DebitNoteLine({ id: '2', lineExtensionAmount: '10.00' });
    const line = new DebitNoteLine({ id: '1', lineExtensionAmount: '10.00', subDebitNoteLines: [inner] });
    expect(line.parseToJson()['cac:SubDebitNoteLine']).toHaveLength(1);
  });

  it('recurses more than one level deep', () => {
    const party = new Party({ agentParty: new Party({ agentParty: new Party({}) }) });
    expect(party.parseToJson()['cac:AgentParty']['cac:AgentParty']).toBeDefined();
  });

  it('places the nested element where the schema sequence puts it', () => {
    // Needs a second child to mean anything. With cac:AgentParty alone the
    // output is the same for every possible `order`, so the assertion would
    // hold even if the value regressed.
    //
    // This matters more than usual here: the generator prepends, so all six
    // new entries sit at the top of their params-map object literal regardless
    // of sequence position, and landing in the right place depends entirely on
    // toNode() sorting by `order`.
    // cbc:MarkCareIndicator is order 1 and cac:AgentParty is 16, so declaration
    // order and sequence order disagree.
    const party = new Party({ markCareIndicator: 'true', agentParty: new Party({}) });

    expect(party.getAsXml(false, true, 'cac:Party')).toBe(
      '<cac:Party><cbc:MarkCareIndicator>true</cbc:MarkCareIndicator><cac:AgentParty/></cac:Party>',
    );
  });
});
