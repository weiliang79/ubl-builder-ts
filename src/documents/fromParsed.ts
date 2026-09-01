import GenericAggregateComponent, { IGenericKeyValue, resolveClassRef } from '../core/GenericAggregateComponent';
import { localName, ParsedElement } from '../core/parse';

/**
 * Turn a parsed element into the params object its component constructor takes.
 *
 * The same tables that write a document read one back: the element name, the
 * key it belongs to, the class it becomes and whether it repeats all come from
 * the params map the component already carries. Nothing here knows about any
 * particular component.
 *
 * Matching is on the local name because the UBL JSON representation drops
 * prefixes — `cac:Party` is written `Party`. That is unambiguous: across all
 * 233 complex types in UBL 2.1, no type has two children whose local names
 * collide.
 */

/** Anything constructible from a params object. */
type Constructor = new (content: unknown, attributes?: unknown) => unknown;

/**
 * One row of either table.
 *
 * A component's params map calls the element name `attributeName` and the
 * document's children map calls it `childName`. They mean the same thing —
 * neither is an XML attribute — and both are public, so this reads whichever
 * is present rather than renaming 519 entries or casting one table into the
 * other's type. Settling on one name is worth doing; it is not worth doing
 * inside a change that has to be provably output-neutral.
 */
export interface ChildEntry {
  order: number;
  attributeName?: string;
  childName?: string;
  max?: number;
  classRef: unknown;
}

const elementNameOf = (entry: ChildEntry): string => entry.attributeName ?? entry.childName ?? '';

/** Is this class a component with a params map, or a leaf datatype? */
function isComponent(classRef: unknown): boolean {
  return typeof classRef === 'function' && (classRef as Constructor).prototype instanceof GenericAggregateComponent;
}

/**
 * A component's params map, without an instance to ask.
 *
 * Constructing an empty probe is safe for every component: assignContent only
 * looks at the keys it is given, so `{}` assigns nothing. The result is cached
 * because a document of any size asks the same question repeatedly.
 */
const mapCache = new Map<unknown, IGenericKeyValue<ChildEntry>>();
function paramsMapOf(classRef: unknown): IGenericKeyValue<ChildEntry> {
  const cached = mapCache.get(classRef);
  if (cached) return cached;

  const probe = new (classRef as Constructor)({}) as GenericAggregateComponent;
  const map = probe.getParamsMap();
  mapCache.set(classRef, map);
  return map;
}

/**
 * Build the value for one child: a component instance, or a datatype instance.
 *
 * Instances rather than nested plain objects, because a component does not
 * accept the latter. `assignContent` hands anything non-primitive to
 * `buildClassInstance`, which reads it as `{ content, attributes }` — so
 * `new AccountingSupplierParty({ party: { industryClassificationCode: '86909' } })`
 * constructs `new Party(undefined, {})` and emits `<cac:Party/>` with the
 * content gone. The declared types require an instance, so no typed code can
 * reach that; a parser handing down the tree it just read would have walked
 * straight into it.
 */
function buildValue(element: ParsedElement, entry: ChildEntry, path: string, unknown: string[]): unknown {
  const classRef = resolveClassRef(entry.classRef) as Constructor;

  if (isComponent(classRef)) {
    return new classRef(paramsFrom(element, paramsMapOf(classRef), path, unknown));
  }
  return new classRef(element.value ?? '', element.attributes);
}

/**
 * Build the params object for `element`, given the map that describes it.
 *
 * Unknown children are collected rather than dropped: a document carrying an
 * element this library cannot represent should say so, not quietly lose it on
 * the way through.
 */
export function paramsFrom(
  element: ParsedElement,
  map: IGenericKeyValue<ChildEntry>,
  path: string,
  unknown: string[],
): Record<string, unknown> {
  const byLocalName = new Map<string, { key: string; entry: ChildEntry }>();
  Object.entries(map).forEach(([key, entry]) => byLocalName.set(localName(elementNameOf(entry)), { key, entry }));

  const params: Record<string, unknown> = {};

  element.children.forEach((child) => {
    const match = byLocalName.get(localName(child.name));
    if (!match) {
      unknown.push(`${path}/${child.name}`);
      return;
    }

    const { key, entry } = match;
    const value = buildValue(child, entry, `${path}/${child.name}`, unknown);

    // Arity comes from the map, never from the document: one occurrence of a
    // repeatable element is indistinguishable from a single-valued one, and
    // guessing would make a one-line invoice round-trip differently from a
    // two-line one.
    if (entry.max === undefined) {
      const existing = (params[key] as unknown[]) ?? [];
      existing.push(value);
      params[key] = existing;
    } else {
      params[key] = value;
    }
  });

  return params;
}
