import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode } from '../datatypes/udt';
import { AlternativeDeliveryLocation } from './Location';

/**
 * cac:EmissionCalculationMethodType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:EmissionCalculationMethodType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  calculationMethodCode: { order: 1, attributeName: 'cbc:CalculationMethodCode', max: 1, classRef: UdtCode },
  fullnessIndicationCode: { order: 2, attributeName: 'cbc:FullnessIndicationCode', max: 1, classRef: UdtCode },
  measurementFromLocation: {
    order: 3,
    attributeName: 'cac:MeasurementFromLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
  measurementToLocation: {
    order: 4,
    attributeName: 'cac:MeasurementToLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
};

type AllowedParams = {
  /** A code signifying the method used to calculate the emission. */
  calculationMethodCode?: string | UdtCode;
  /** A code signifying whether a piece of transport equipment is full, partially full, or empty. This indication is used as a parameter when calculating the environmental emission. */
  fullnessIndicationCode?: string | UdtCode;
  /** A start location from which an environmental emission is calculated. */
  measurementFromLocation?: AlternativeDeliveryLocation;
  /** An end location to which an environmental emission is calculated. */
  measurementToLocation?: AlternativeDeliveryLocation;
};

class EmissionCalculationMethod extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:EmissionCalculationMethod');
  }
}

export { EmissionCalculationMethod, AllowedParams as EmissionCalculationMethodParams };
