import * as cac from '../../src/cac';
import GenericAggregateComponent, { resolveClassRef } from '../../src/core/GenericAggregateComponent';

/**
 * Resolve and serialise every params-map entry of every exported component.
 *
 * check:classref holds each `classRef` to the schema, but it reads source text.
 * It cannot see a reference that resolves to `undefined` at runtime, which is
 * what an eager reference across an import cycle does — the defect that once
 * broke six BillingReference entries and is why `resolveClassRef` exists. The
 * cycles are dense now that all 109 components are present, so this walks the
 * whole graph rather than sampling it.
 *
 * It also catches a placeholder left behind: `BillingReference
 * .billingReferenceLine` carried `classRef: null` from before its type had a
 * class, which resolves to an object and throws on use.
 */
describe('every classRef in the package', () => {
  /** A value each datatype will accept, so a failure here is never the probe's. */
  const sampleFor = (name: string): unknown => {
    if (/DateTime$/.test(name)) return '2026-09-02T00:00:00Z';
    if (/Date$/.test(name)) return '2026-09-02';
    if (/Time$/.test(name)) return '00:00:00Z';
    if (/Indicator$/.test(name)) return 'true';
    if (/(Numeric|Amount|Quantity|Measure|Percent|Rate|Value)$/.test(name)) return '1';
    if (/(BinaryObject|Graphic|Picture|Sound|Video)$/.test(name)) return 'AA==';
    return 'x';
  };

  const components = Object.entries(cac).filter(
    ([, value]) => typeof value === 'function' && value.prototype instanceof GenericAggregateComponent,
  ) as [string, new (content: unknown) => GenericAggregateComponent][];

  it('exports components to walk', () => {
    expect(components.length).toBeGreaterThan(200);
  });

  it('resolves every entry to a constructor and serialises it', () => {
    const failures: string[] = [];
    let entries = 0;

    components.forEach(([name, Component]) => {
      let probe: GenericAggregateComponent;
      try {
        probe = new Component({});
      } catch (error) {
        failures.push(`${name}: cannot construct — ${(error as Error).message}`);
        return;
      }

      Object.entries(probe.getParamsMap()).forEach(([key, entry]) => {
        entries += 1;
        const resolved = resolveClassRef(entry.classRef) as unknown;
        if (typeof resolved !== 'function') {
          failures.push(`${name}.${key}: classRef is ${resolved === undefined ? 'undefined' : typeof resolved}`);
          return;
        }

        const Ref = resolved as new (content: unknown) => unknown;
        try {
          const child = Ref.prototype instanceof GenericAggregateComponent ? new Ref({}) : new Ref(sampleFor(Ref.name));
          new Component({ [key]: entry.max === undefined ? [child] : child }).getAsXml(false, true, 'cac:Probe');
        } catch (error) {
          failures.push(`${name}.${key}: ${(error as Error).message}`);
        }
      });
    });

    expect(entries).toBeGreaterThan(3000);
    expect(failures).toEqual([]);
  });
});
