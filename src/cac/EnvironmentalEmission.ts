import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtMeasure, UdtText } from '../datatypes/udt';
import { EmissionCalculationMethod } from './EmissionCalculationMethod';

/**
 * cac:EnvironmentalEmissionType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:EnvironmentalEmissionType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  environmentalEmissionTypeCode: {
    order: 1,
    attributeName: 'cbc:EnvironmentalEmissionTypeCode',
    max: 1,
    classRef: UdtCode,
  },
  valueMeasure: { order: 2, attributeName: 'cbc:ValueMeasure', max: 1, classRef: UdtMeasure },
  descriptions: { order: 3, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  emissionCalculationMethods: {
    order: 4,
    attributeName: 'cac:EmissionCalculationMethod',
    max: undefined,
    classRef: () => EmissionCalculationMethod,
  },
};

type AllowedParams = {
  /** A code specifying the type of environmental emission. */
  environmentalEmissionTypeCode: string | UdtCode;
  /** A value measurement for the environmental emission. */
  valueMeasure: string | UdtMeasure;
  /** Text describing this environmental emission. */
  descriptions?: (string | UdtText)[];
  /** A method used to calculate the amount of this emission. */
  emissionCalculationMethods?: EmissionCalculationMethod[];
};

class EnvironmentalEmission extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:EnvironmentalEmission');
  }
}

export { EnvironmentalEmission, AllowedParams as EnvironmentalEmissionParams };
