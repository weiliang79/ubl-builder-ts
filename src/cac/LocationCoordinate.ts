import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtMeasure } from '../datatypes/udt';

/**
 * cac:LocationCoordinateType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:LocationCoordinateType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  coordinateSystemCode: { order: 1, attributeName: 'cbc:CoordinateSystemCode', max: 1, classRef: UdtCode },
  latitudeDegreesMeasure: { order: 2, attributeName: 'cbc:LatitudeDegreesMeasure', max: 1, classRef: UdtMeasure },
  latitudeMinutesMeasure: { order: 3, attributeName: 'cbc:LatitudeMinutesMeasure', max: 1, classRef: UdtMeasure },
  latitudeDirectionCode: { order: 4, attributeName: 'cbc:LatitudeDirectionCode', max: 1, classRef: UdtCode },
  longitudeDegreesMeasure: { order: 5, attributeName: 'cbc:LongitudeDegreesMeasure', max: 1, classRef: UdtMeasure },
  longitudeMinutesMeasure: { order: 6, attributeName: 'cbc:LongitudeMinutesMeasure', max: 1, classRef: UdtMeasure },
  longitudeDirectionCode: { order: 7, attributeName: 'cbc:LongitudeDirectionCode', max: 1, classRef: UdtCode },
  altitudeMeasure: { order: 8, attributeName: 'cbc:AltitudeMeasure', max: 1, classRef: UdtMeasure },
};

type AllowedParams = {
  /** A code signifying the location system used. */
  coordinateSystemCode?: string | UdtCode;
  /** The degree component of a latitude measured in degrees and minutes. */
  latitudeDegreesMeasure?: string | UdtMeasure;
  /** The minutes component of a latitude measured in degrees and minutes (modulo 60). */
  latitudeMinutesMeasure?: string | UdtMeasure;
  /** A code signifying the direction of latitude measurement from the equator (north or south). */
  latitudeDirectionCode?: string | UdtCode;
  /** The degree component of a longitude measured in degrees and minutes. */
  longitudeDegreesMeasure?: string | UdtMeasure;
  /** The minutes component of a longitude measured in degrees and minutes (modulo 60). */
  longitudeMinutesMeasure?: string | UdtMeasure;
  /** A code signifying the direction of longitude measurement from the prime meridian (east or west). */
  longitudeDirectionCode?: string | UdtCode;
  /** The altitude of the location. */
  altitudeMeasure?: string | UdtMeasure;
};

class LocationCoordinate extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:LocationCoordinate');
  }
}

export { LocationCoordinate, AllowedParams as LocationCoordinateParams };
