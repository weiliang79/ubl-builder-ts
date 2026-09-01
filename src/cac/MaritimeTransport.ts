import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier, UdtMeasure, UdtName, UdtText } from '../datatypes/udt';
import { DocumentReference } from './DocumentReference';
import { AlternativeDeliveryLocation } from './Location';

/**
 * cac:MaritimeTransportType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:MaritimeTransportType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  vesselID: { order: 1, attributeName: 'cbc:VesselID', max: 1, classRef: UdtIdentifier },
  vesselName: { order: 2, attributeName: 'cbc:VesselName', max: 1, classRef: UdtName },
  radioCallSignID: { order: 3, attributeName: 'cbc:RadioCallSignID', max: 1, classRef: UdtIdentifier },
  shipsRequirementses: { order: 4, attributeName: 'cbc:ShipsRequirements', max: undefined, classRef: UdtText },
  grossTonnageMeasure: { order: 5, attributeName: 'cbc:GrossTonnageMeasure', max: 1, classRef: UdtMeasure },
  netTonnageMeasure: { order: 6, attributeName: 'cbc:NetTonnageMeasure', max: 1, classRef: UdtMeasure },
  registryCertificateDocumentReference: {
    order: 7,
    attributeName: 'cac:RegistryCertificateDocumentReference',
    max: 1,
    classRef: () => DocumentReference,
  },
  registryPortLocation: {
    order: 8,
    attributeName: 'cac:RegistryPortLocation',
    max: 1,
    classRef: () => AlternativeDeliveryLocation,
  },
};

type AllowedParams = {
  /** An identifier for a specific vessel. */
  vesselID?: string | UdtIdentifier;
  /** The name of the vessel. */
  vesselName?: string | UdtName;
  /** The radio call sign of the vessel. */
  radioCallSignID?: string | UdtIdentifier;
  /** Information about what services a vessel will require when it arrives at a port, such as refueling, maintenance, waste disposal etc. */
  shipsRequirementses?: (string | UdtText)[];
  /** Gross tonnage is calculated by measuring a ship's volume (from keel to funnel, to the outside of the hull framing) and applying a mathematical formula and is used to determine things such as a ship's manning regulations, safety rules, registration fees and port dues. */
  grossTonnageMeasure?: string | UdtMeasure;
  /** Net tonnage is calculated by measuring a ship's internal volume and applying a mathematical formula and is used to calculate the port duties. */
  netTonnageMeasure?: string | UdtMeasure;
  /** The certificate issued to the ship by the ships registry in a given flag state. */
  registryCertificateDocumentReference?: DocumentReference;
  /** The port in which a vessel is registered or permanently based. */
  registryPortLocation?: AlternativeDeliveryLocation;
};

class MaritimeTransport extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:MaritimeTransport');
  }
}

export { MaritimeTransport, AllowedParams as MaritimeTransportParams };
