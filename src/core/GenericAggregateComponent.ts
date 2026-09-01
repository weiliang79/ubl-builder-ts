import { toXmlObject, toXmlString } from './serialize';
import { NodeSource, XmlContent, XmlNode } from './xmlNode';

export type ParamsMapValues = {
  order: number;
  attributeName: string;
  max?: number;
  classRef: any;
};

export interface IGenericKeyValue<T> {
  [id: string]: T;
}

/**
 * Resolve a classRef that may be deferred.
 *
 * UBL's type graph has cycles — a Party contains an AgentParty, a
 * BillingReference contains DocumentReferences that lead back to it — and a
 * params map is a module-level constant, so an eager reference across a cycle
 * captures `undefined` before the other module has finished loading. Six
 * entries in BillingReference were broken this way, throwing "classRef is
 * required" for anyone who used them.
 *
 * Writing such a reference as `() => Thing` defers it to first use, by which
 * point both modules are loaded. Classes are told apart from arrow functions
 * by `prototype`, which only the former has.
 */
export function resolveClassRef(classRef: any): any {
  return typeof classRef === 'function' && !classRef.prototype ? classRef() : classRef;
}

/**
 * Generic class to avoid repeat several code in all CommonAggregateComponent files
 */
export default class GenericAggregateComponent {
  private paramsMap: IGenericKeyValue<ParamsMapValues> = {};
  protected attributes: IGenericKeyValue<any> = {};

  /**
   * Default element name used when this component is serialized on its own.
   *
   * It is only a default. A component's element name is decided by its
   * *parent* — the `attributeName` in the parent's params map — because the
   * same UBL type appears under different names depending on position:
   * PeriodType is cac:InvoicePeriod under Invoice and cac:ValidityPeriod
   * under Price. Pass an explicit name to getAsXml() when the default is
   * not the one you want.
   */
  protected readonly elementName: string;

  /**
   * @param content component content
   * @param paramsMap Params Map
   * @param [elementName="GenericAggregateComponent"] default element name
   */
  constructor(content: any, paramsMap: IGenericKeyValue<ParamsMapValues>, elementName = 'GenericAggregateComponent') {
    this.elementName = elementName;
    this.paramsMap = paramsMap;
    this.assignContent(content);
  }

  /**
   * Describe this component as a neutral node.
   *
   * Children come out as an ordered list rather than a keyed object, so
   * xsd:sequence position is carried by the structure itself instead of
   * depending on object key ordering.
   */
  toNode(): XmlContent {
    const children: XmlNode[] = [];

    Object.keys(this.paramsMap)
      .filter((attKey) => this.attributes[attKey] !== undefined && this.attributes[attKey] !== null)
      // UBL complex types are xsd:sequence, so element order is significant.
      // Sorting on `order` makes that explicit rather than relying on the
      // declaration order of the params map object literal.
      .sort((a, b) => this.paramsMap[a].order - this.paramsMap[b].order)
      .forEach((attKey) => {
        const { attributeName, max } = this.paramsMap[attKey];
        const value = this.attributes[attKey];

        if (Array.isArray(value)) {
          if (max !== undefined) {
            throw new Error('array given and max is defined validate structure');
          }
          value.forEach((item: NodeSource) => children.push({ name: attributeName, repeats: true, ...item.toNode() }));
        } else {
          children.push({ name: attributeName, ...value.toNode() });
        }
      });

    return { children };
  }

  /**
   * @deprecated Prefer {@link toNode}. Retained because Invoice and the test
   * suite still read the xmlbuilder2 dialect directly.
   *
   * Returns `any` deliberately: this is a compatibility shim, and narrowing
   * it to the serializer's own type would make every existing call site that
   * indexes into the result a type error.
   */
  parseToJson(): any {
    return toXmlObject(this.toNode());
  }

  /**
   * The params map this component was built with.
   *
   * Reading a document back needs the same table that writes one: which
   * element name goes with which key, what class it becomes, and whether it
   * repeats. Without this the parser would need a second copy of all 519
   * entries, and a second copy is how every drift in this package started.
   */
  getParamsMap(): IGenericKeyValue<ParamsMapValues> {
    return this.paramsMap;
  }

  assignContent(content: any) {
    Object.keys(content || {})
      .filter((att) => content[att] != null)
      .forEach((att: string) => {
        const mapValue = this.paramsMap[att];
        if (!mapValue) {
          throw new Error(`attribute ${att} is not allowed`);
        }

        const AbstractClass = resolveClassRef(mapValue.classRef);
        const { max } = mapValue;
        if (!AbstractClass) {
          throw new Error('classRef is required');
        }

        if (Array.isArray(content[att])) {
          if (max !== undefined && content[att].length > max) {
            throw new Error(`${att} max occurrences is ${max}`);
          }

          this.attributes[att] = content[att].map((subItem: any) => this.buildClassInstance(AbstractClass, subItem));
        } else {
          this.attributes[att] = this.buildClassInstance(AbstractClass, content[att]);
        }
      });
  }

  private buildClassInstance(AbstractClass: any, rawValue: any) {
    if (rawValue instanceof AbstractClass) {
      return rawValue;
    }

    if (['boolean', 'string', 'number'].includes(typeof rawValue)) {
      return new AbstractClass(rawValue);
    }

    return new AbstractClass(rawValue?.content, rawValue?.attributes || {});
  }

  /**
   * Serialize this component on its own, wrapped in a single root element.
   *
   * The wrapper is required: parseToJson() returns one key per child, and an
   * XML document cannot have more than one root. Without it this threw
   * "Document already has a document element" for every component with more
   * than one child, and silently emitted a bare, unwrapped child for the rest.
   *
   * @param {boolean} [pretty=true] pretty-print the output
   * @param {boolean} [headless=false] omit the XML declaration
   * @param {string} [elementName] override the default element name; see
   *        {@link elementName} for why the default may not be the right one
   */
  getAsXml(pretty = true, headless = false, elementName: string = this.elementName) {
    return toXmlString({ name: elementName, ...this.toNode() }, { pretty, headless });
  }

  /**
   * @param {boolean} [deep=false] true for deep print
   */
  getAsJson(_deep = false) {
    return this.parseToJson();
  }
}
