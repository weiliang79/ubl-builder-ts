import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtMeasure, UdtName, UdtQuantity, UdtText } from '../datatypes/udt';
import { HazardousGoodsTransit } from './HazardousGoodsTransit';
import { Party } from './Party';
import { SecondaryHazard } from './SecondaryHazard';
import { AdditionalTemperature, EmergencyTemperature, FlashpointTemperature } from './Temperature';

/**
 * cac:HazardousItemType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:HazardousItemType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  placardNotation: { order: 2, attributeName: 'cbc:PlacardNotation', max: 1, classRef: UdtText },
  placardEndorsement: { order: 3, attributeName: 'cbc:PlacardEndorsement', max: 1, classRef: UdtText },
  additionalInformations: { order: 4, attributeName: 'cbc:AdditionalInformation', max: undefined, classRef: UdtText },
  undgCode: { order: 5, attributeName: 'cbc:UNDGCode', max: 1, classRef: UdtCode },
  emergencyProceduresCode: { order: 6, attributeName: 'cbc:EmergencyProceduresCode', max: 1, classRef: UdtCode },
  medicalFirstAidGuideCode: { order: 7, attributeName: 'cbc:MedicalFirstAidGuideCode', max: 1, classRef: UdtCode },
  technicalName: { order: 8, attributeName: 'cbc:TechnicalName', max: 1, classRef: UdtName },
  categoryName: { order: 9, attributeName: 'cbc:CategoryName', max: 1, classRef: UdtName },
  hazardousCategoryCode: { order: 10, attributeName: 'cbc:HazardousCategoryCode', max: 1, classRef: UdtCode },
  upperOrangeHazardPlacardID: {
    order: 11,
    attributeName: 'cbc:UpperOrangeHazardPlacardID',
    max: 1,
    classRef: UdtIdentifier,
  },
  lowerOrangeHazardPlacardID: {
    order: 12,
    attributeName: 'cbc:LowerOrangeHazardPlacardID',
    max: 1,
    classRef: UdtIdentifier,
  },
  markingID: { order: 13, attributeName: 'cbc:MarkingID', max: 1, classRef: UdtIdentifier },
  hazardClassID: { order: 14, attributeName: 'cbc:HazardClassID', max: 1, classRef: UdtIdentifier },
  netWeightMeasure: { order: 15, attributeName: 'cbc:NetWeightMeasure', max: 1, classRef: UdtMeasure },
  netVolumeMeasure: { order: 16, attributeName: 'cbc:NetVolumeMeasure', max: 1, classRef: UdtMeasure },
  quantity: { order: 17, attributeName: 'cbc:Quantity', max: 1, classRef: UdtQuantity },
  contactParty: { order: 18, attributeName: 'cac:ContactParty', max: 1, classRef: () => Party },
  secondaryHazards: {
    order: 19,
    attributeName: 'cac:SecondaryHazard',
    max: undefined,
    classRef: () => SecondaryHazard,
  },
  hazardousGoodsTransits: {
    order: 20,
    attributeName: 'cac:HazardousGoodsTransit',
    max: undefined,
    classRef: () => HazardousGoodsTransit,
  },
  emergencyTemperature: {
    order: 21,
    attributeName: 'cac:EmergencyTemperature',
    max: 1,
    classRef: () => EmergencyTemperature,
  },
  flashpointTemperature: {
    order: 22,
    attributeName: 'cac:FlashpointTemperature',
    max: 1,
    classRef: () => FlashpointTemperature,
  },
  additionalTemperatures: {
    order: 23,
    attributeName: 'cac:AdditionalTemperature',
    max: undefined,
    classRef: () => AdditionalTemperature,
  },
};

type AllowedParams = {
  /** An identifier for this hazardous item. */
  id?: string | UdtIdentifier;
  /** Text of the placard notation corresponding to the hazard class of this hazardous item. Can also be the hazard identification number of the orange placard (upper part) required on the means of transport. */
  placardNotation?: string | UdtText;
  /** Text of the placard endorsement that is to be shown on the shipping papers for this hazardous item. Can also be used for the number of the orange placard (lower part) required on the means of transport. */
  placardEndorsement?: string | UdtText;
  /** Text providing further information about the hazardous substance. */
  additionalInformations?: (string | UdtText)[];
  /** The UN code for this kind of hazardous item. */
  undgCode?: string | UdtCode;
  /** A code signifying the emergency procedures for this hazardous item. */
  emergencyProceduresCode?: string | UdtCode;
  /** A code signifying a medical first aid guide appropriate to this hazardous item. */
  medicalFirstAidGuideCode?: string | UdtCode;
  /** The full technical name of a specific hazardous substance contained in this goods item. */
  technicalName?: string | UdtName;
  /** The name of the category of hazard that applies to the Item. */
  categoryName?: string | UdtName;
  /** A code signifying a kind of hazard for a material. */
  hazardousCategoryCode?: string | UdtCode;
  /** The number for the upper part of the orange hazard placard required on the means of transport. */
  upperOrangeHazardPlacardID?: string | UdtIdentifier;
  /** The number for the lower part of the orange hazard placard required on the means of transport. */
  lowerOrangeHazardPlacardID?: string | UdtIdentifier;
  /** An identifier to the marking of the Hazardous Item */
  markingID?: string | UdtIdentifier;
  /** An identifier for the hazard class applicable to this hazardous item as defined by the relevant regulation authority (e.g., the IMDG Class Number of the SOLAS Convention of IMO and the ADR/RID Class Number for the road/rail environment). */
  hazardClassID?: string | UdtIdentifier;
  /** The net weight of this hazardous item, excluding packaging. */
  netWeightMeasure?: string | UdtMeasure;
  /** The volume of this hazardous item, excluding packaging and transport equipment. */
  netVolumeMeasure?: string | UdtMeasure;
  /** The quantity of goods items in this hazardous item that are hazardous. */
  quantity?: string | UdtQuantity;
  /** The individual, group, or body to be contacted in case of a hazardous incident associated with this item. */
  contactParty?: Party;
  /** A secondary hazard associated with this hazardous item. */
  secondaryHazards?: SecondaryHazard[];
  /** Information related to the transit of this kind of hazardous goods. */
  hazardousGoodsTransits?: HazardousGoodsTransit[];
  /** The threshold temperature at which emergency procedures apply in the handling of temperature-controlled goods. */
  emergencyTemperature?: EmergencyTemperature;
  /** The flashpoint temperature of this hazardous item; i.e., the lowest temperature at which vapors above a volatile combustible substance ignite in air when exposed to flame. */
  flashpointTemperature?: FlashpointTemperature;
  /** Another temperature relevant to the handling of this hazardous item. */
  additionalTemperatures?: AdditionalTemperature[];
};

class HazardousItem extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:HazardousItem');
  }
}

export { HazardousItem, AllowedParams as HazardousItemParams };
