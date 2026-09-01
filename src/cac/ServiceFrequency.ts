import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode } from '../datatypes/udt';

/**
 * cac:ServiceFrequencyType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:ServiceFrequencyType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  weekDayCode: { order: 1, attributeName: 'cbc:WeekDayCode', max: 1, classRef: UdtCode },
};

type AllowedParams = {
  /** A day of the week, expressed as code. */
  weekDayCode: string | UdtCode;
};

class ServiceFrequency extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ServiceFrequency');
  }
}

export { ServiceFrequency as ScheduledServiceFrequency, ServiceFrequency, AllowedParams as ServiceFrequencyParams };
