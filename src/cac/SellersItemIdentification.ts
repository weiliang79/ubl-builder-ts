import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier } from '../datatypes/udt';
import { MeasurementDimension } from './Dimension';
import { Party } from './Party';
import { PhysicalAttribute } from './PhysicalAttribute';

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  physicalAttributes: {
    order: 4,
    attributeName: 'cac:PhysicalAttribute',
    max: undefined,
    classRef: () => PhysicalAttribute,
  },
  measurementDimensions: {
    order: 5,
    attributeName: 'cac:MeasurementDimension',
    max: undefined,
    classRef: () => MeasurementDimension,
  },
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  extendedID: { order: 2, attributeName: 'cbc:ExtendedID', max: 1, classRef: UdtIdentifier },
  barcodeSymbologyID: { order: 3, attributeName: 'cbc:BarcodeSymbologyID', max: 1, classRef: UdtIdentifier },
  issuerParty: { order: 6, attributeName: 'cac:IssuerParty', max: 1, classRef: () => Party },
};

type AllowedParams = {
  /** A physical attribute of the item. */
  physicalAttributes?: PhysicalAttribute[];
  /** A measurable dimension (length, mass, weight, or volume) of the item. */
  measurementDimensions?: MeasurementDimension[];
  /** An extended identifier for the item that identifies the item with specific properties, e.g., Item 123 = Chair / Item 123 Ext 45 = brown chair. Two chairs can have the same item number, but one is brown. The other is white. */
  extendedID?: string | UdtIdentifier;
  /** An identifier for a system of barcodes. */
  barcodeSymbologyID?: string | UdtIdentifier;
  /** The party that issued this item identification. */
  issuerParty?: Party;
  id: string | UdtIdentifier;
};

/**
 *
 */
class SellersItemIdentification extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:SellersItemIdentification');
  }
}

export { SellersItemIdentification, AllowedParams as SellersItemIdentificationParams };
