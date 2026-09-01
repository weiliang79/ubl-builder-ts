import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtName } from '../datatypes/udt';

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  name: { order: 2, attributeName: 'cbc:Name', max: 1, classRef: UdtName },
  localeCode: { order: 3, attributeName: 'cbc:LocaleCode', max: 1, classRef: UdtCode },
};

type AllowedParams = {
  /** An identifier for this language */
  id?: UdtIdentifier | string;
  /** The name of this language */
  name?: UdtName | string;
  /**  A code signifying the locale in which this language is used */
  localeCode?: UdtCode | string;
};

class Language extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Language');
  }
}

export { Language, AllowedParams as LanguageParams };
