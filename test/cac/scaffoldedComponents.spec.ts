import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import * as cac from '../../src/cac';
import {
  CardAccount,
  Consignment,
  Dimension,
  GoodsItem,
  Item,
  Package,
  PaymentMeans,
  Person,
  ShipmentType,
  TransportEquipment,
} from '../../src/cac';

/**
 * Fifty-eight components were written from the schema by `npm run scaffold`,
 * because generate:complete adds children to a component that exists and cannot
 * create one. Thirty-one children were unreachable for want of them.
 *
 * check:schema, check:types and check:classref hold every one of these to the
 * same schema they hold the hand-written files to, so what needs testing is
 * what metadata cannot show: that they construct, nest and serialise.
 */
describe('components generated from the schema', () => {
  it('reaches the children that had no class', () => {
    const means = new PaymentMeans({
      paymentMeansCode: '30',
      cardAccount: new CardAccount({ primaryAccountNumberID: '4111', networkID: 'VISA' }),
    });

    expect(means.getAsXml(false, true, 'cac:PaymentMeans')).toBe(
      '<cac:PaymentMeans>' +
        '<cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>' +
        '<cac:CardAccount><cbc:PrimaryAccountNumberID>4111</cbc:PrimaryAccountNumberID>' +
        '<cbc:NetworkID>VISA</cbc:NetworkID></cac:CardAccount>' +
        '</cac:PaymentMeans>',
    );
  });

  it('nests a scaffolded component inside a hand-written one', () => {
    const shipment = new ShipmentType({ id: 'SHP-1', goodsItems: [new GoodsItem({ id: 'G-1' })] });

    expect(shipment.getAsXml(false, true, 'cac:Shipment')).toContain(
      '<cac:GoodsItem><cbc:ID>G-1</cbc:ID></cac:GoodsItem>',
    );
  });

  // The failure this generator hit on its first run: a self-referential child
  // must name the class the file declares, not the export alias. An alias is a
  // ReferenceError at first use, which no gate over metadata can see.
  it.each([
    [
      'Consignment',
      () => new Consignment({ id: 'C-1', childConsignments: [new Consignment({ id: 'C-2' })] }),
      'cac:ChildConsignment',
    ],
    [
      'GoodsItem',
      () => new GoodsItem({ id: 'G-1', containedGoodsItems: [new GoodsItem({ id: 'G-2' })] }),
      'cac:ContainedGoodsItem',
    ],
    [
      'Package',
      () => new Package({ id: 'P-1', containedPackages: [new Package({ id: 'P-2' })] }),
      'cac:ContainedPackage',
    ],
    [
      'TransportEquipment',
      () =>
        new TransportEquipment({
          id: 'T-1',
          attachedTransportEquipments: [new TransportEquipment({ id: 'T-2' })],
        }),
      'cac:AttachedTransportEquipment',
    ],
  ])('nests %s inside itself', (name, build, element) => {
    expect(build().getAsXml(false, true, `cac:${name}`)).toContain(`<${element}><cbc:ID>`);
  });

  it('sorts a scaffolded params map by schema sequence, not declaration order', () => {
    // cbc:ID is order 1 on ItemType and cac:Dimension is 32, so passing them
    // the other way round only comes out right if toNode() sorts on `order`.
    const item = new Item({ dimensions: [new Dimension({ attributeID: 'AAA' })], name: 'Widget' });
    const xml = item.getAsXml(false, true, 'cac:Item');

    expect(xml.indexOf('<cbc:Name>')).toBeLessThan(xml.indexOf('<cac:Dimension>'));
  });

  it('exports every generated class and params type from the barrel', () => {
    // check:types gates this, but only over source text. This is the built
    // module: a class that does not survive the barrel is not importable.
    const generated = readdirSync(join(__dirname, '..', '..', 'src', 'cac'))
      .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
      .filter((file) =>
        readFileSync(join(__dirname, '..', '..', 'src', 'cac', file), 'utf8').includes('npm run scaffold'),
      );

    expect(generated.length).toBeGreaterThan(50);
    generated.forEach((file) => expect(cac).toHaveProperty(file.replace(/\.ts$/, '')));
  });

  it('builds a person, which UBL marks as having no required child', () => {
    expect(new Person({ firstName: 'Ada', familyName: 'Lovelace' }).getAsXml(false, true, 'cac:Person')).toBe(
      '<cac:Person><cbc:FirstName>Ada</cbc:FirstName><cbc:FamilyName>Lovelace</cbc:FamilyName></cac:Person>',
    );
  });
});
