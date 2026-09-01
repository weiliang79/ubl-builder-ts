import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtName } from '../datatypes/udt';
import { JurisdictionRegionAddress } from './Address';

/*
  cbc:ID [0..1]    An identifier for this taxation scheme.
  cbc:Name [0..1]    The name of this taxation scheme.
  cbc:TaxTypeCode [0..1]    A code signifying the type of tax.
  cbc:CurrencyCode [0..1]    A code signifying the currency in which the tax is collected and reported.
  cac:JurisdictionRegionAddress [0..*]    A geographic area in which this taxation scheme applies.
*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  name: { order: 2, attributeName: 'cbc:Name', max: 1, classRef: UdtName },
  taxTypeCode: { order: 3, attributeName: 'cbc:TaxTypeCode', max: 1, classRef: UdtCode },
  currencyCode: { order: 4, attributeName: 'cbc:CurrencyCode', max: 1, classRef: UdtCode },
  jurisdictionRegionAddress: {
    order: 5,
    attributeName: 'cac:JurisdictionRegionAddress',
    max: undefined,
    classRef: () => JurisdictionRegionAddress,
  },
};

type AllowedParams = {
  id?: string | UdtIdentifier;
  name?: string | UdtName;
  taxTypeCode?: string | UdtCode;
  currencyCode?: string | UdtCode;
  jurisdictionRegionAddress?: string | JurisdictionRegionAddress;
};

/**
 * A class to describe a taxation scheme (e.g., VAT, State tax, County tax).
 */
class TaxScheme extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:TaxScheme');
  }

  /**
   *
   * @param value
   */
  setId(value: string | UdtIdentifier) {
    this.attributes.id = value instanceof UdtIdentifier ? value : new UdtIdentifier(value);
  }

  /**
   *  return Tax's id
   * @param rawValue
   */
  getId(rawValue = true): UdtIdentifier | string {
    return rawValue ? this.attributes.id.content : this.attributes.id;
  }

  /**
   *
   * @param value
   */
  setName(value: string | UdtName) {
    this.attributes.name = value instanceof UdtName ? value : new UdtName(value);
  }

  /**
   *
   * @param {boolean} rawValue
   */
  getName(rawValue = true) {
    return rawValue ? this.attributes.name.content : this.attributes.name;
  }
}

export { TaxScheme, AllowedParams as TaxSchemeParams };
