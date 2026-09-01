import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier, UdtMeasure, UdtText } from '../datatypes/udt';

/**
 * cac:DimensionType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:DimensionType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  attributeID: { order: 1, attributeName: 'cbc:AttributeID', max: 1, classRef: UdtIdentifier },
  measure: { order: 2, attributeName: 'cbc:Measure', max: 1, classRef: UdtMeasure },
  descriptions: { order: 3, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  minimumMeasure: { order: 4, attributeName: 'cbc:MinimumMeasure', max: 1, classRef: UdtMeasure },
  maximumMeasure: { order: 5, attributeName: 'cbc:MaximumMeasure', max: 1, classRef: UdtMeasure },
};

type AllowedParams = {
  /** An identifier for the attribute to which the measure applies. */
  attributeID: string | UdtIdentifier;
  /** The measurement value. */
  measure?: string | UdtMeasure;
  /** Text describing the measurement attribute. */
  descriptions?: (string | UdtText)[];
  /** The minimum value in a range of measurement of this dimension. */
  minimumMeasure?: string | UdtMeasure;
  /** The maximum value in a range of measurement of this dimension. */
  maximumMeasure?: string | UdtMeasure;
};

class Dimension extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:Dimension');
  }
}

export {
  Dimension,
  AllowedParams as DimensionParams,
  Dimension as FloorSpaceMeasurementDimension,
  Dimension as MeasurementDimension,
  Dimension as PalletSpaceMeasurementDimension,
  Dimension as RangeDimension,
  Dimension as TotalCapacityDimension,
};
