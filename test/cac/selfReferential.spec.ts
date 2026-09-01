import { AlternativeDeliveryLocation, CreditNoteLine, Party, PriceList } from '../../src/cac';

/**
 * Four UBL types contain themselves: a Party has an AgentParty, a Location has
 * SubsidiaryLocations, and so on. Their params maps must reference the class
 * the file is still in the middle of declaring, which only works through a lazy
 * `classRef: () => X` resolved on first use.
 *
 * Nothing else can catch a mistake here. TypeScript is satisfied either way —
 * the binding exists at type level regardless — and the schema and params-map
 * gates only compare metadata. An eager reference, or one naming an export
 * alias rather than the declared class, fails at runtime and only when someone
 * actually sets the child.
 *
 * The casts below are incidental. CreditNoteLine, Location and PriceList mark
 * most of their AllowedParams fields required even though UBL leaves them
 * optional — CreditNoteLine demands 23 of them. That is a separate defect;
 * assignContent skips undefined at runtime, so omitting them is safe, and the
 * casts keep this file about the lazy classRef rather than about that.
 */
type Args<T extends abstract new (...a: never[]) => unknown> = ConstructorParameters<T>[0];
describe('self-referential children', () => {
  it('nests a Party inside a Party through cac:AgentParty', () => {
    const party = new Party({ agentParty: new Party({}) });
    expect(party.parseToJson()['cac:AgentParty']).toBeDefined();
  });

  it('nests a CreditNoteLine inside a CreditNoteLine', () => {
    const empty = {} as Args<typeof CreditNoteLine>;
    const line = new CreditNoteLine({ subCreditNoteLines: [new CreditNoteLine(empty)] } as Args<typeof CreditNoteLine>);
    expect(line.parseToJson()['cac:SubCreditNoteLine']).toHaveLength(1);
  });

  it('nests a PriceList inside a PriceList', () => {
    const empty = {} as Args<typeof PriceList>;
    const list = new PriceList({ previousPriceList: new PriceList(empty) } as Args<typeof PriceList>);
    expect(list.parseToJson()['cac:PreviousPriceList']).toBeDefined();
  });

  it('nests a Location inside a Location, reached through an export alias', () => {
    const empty = {} as Args<typeof AlternativeDeliveryLocation>;
    const location = new AlternativeDeliveryLocation({
      subsidiaryLocations: [new AlternativeDeliveryLocation(empty)],
    } as Args<typeof AlternativeDeliveryLocation>);
    expect(location.parseToJson()['cac:SubsidiaryLocation']).toHaveLength(1);
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
    // This matters more than usual here: all four new entries are written as
    // the *first* key of their params-map object literal, so landing in the
    // right position depends entirely on toNode() sorting by `order`.
    // cbc:MarkCareIndicator is order 1 and cac:AgentParty is 16, so declaration
    // order and sequence order disagree.
    const party = new Party({ markCareIndicator: 'true', agentParty: new Party({}) });

    expect(party.getAsXml(false, true, 'cac:Party')).toBe(
      '<cac:Party><cbc:MarkCareIndicator>true</cbc:MarkCareIndicator><cac:AgentParty/></cac:Party>',
    );
  });
});
