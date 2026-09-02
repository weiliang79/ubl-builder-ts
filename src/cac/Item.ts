import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIndicator, UdtName, UdtQuantity, UdtText } from '../datatypes/udt';
import { UdtNumeric } from '../datatypes/udt/UdtNumeric';
import { OriginAddress } from './Address';
import { Certificate } from './Certificate';
import { CommodityClassification } from './CommodityClassification';
import { Country } from './Country';
import { Dimension } from './Dimension';
import { DocumentReference } from './DocumentReference';
import { HazardousItem } from './HazardousItem';
import { ItemInstance } from './ItemInstance';
import { AdditionalItemProperty } from './ItemProperty';
import { Party } from './Party';
import { SellersItemIdentification } from './SellersItemIdentification';
import { ClassifiedTaxCategory } from './TaxCategory';
import { TransactionConditions } from './TransactionConditions';

/*
    1   cbc:Description [0..*]    Text describing this item.
    2   cbc:PackQuantity [0..1]    The unit packaging quantity; the number of subunits making up this item.
    3   cbc:PackSizeNumeric [0..1]    The number of items in a pack of this item.
    4   cbc:CatalogueIndicator [0..1]    An indicator that this item was ordered from a catalogue (true) or not (false).
    5   cbc:Name [0..1]    A short name optionally given to this item, such as a name from a catalogue, as distinct from a description.
    6   cbc:HazardousRiskIndicator [0..1]    An indication that the transported item, as delivered, is subject to an international regulation concerning the carriage of dangerous goods (true) or not (false).
    7   cbc:AdditionalInformation [0..*]    Further details regarding this item (e.g., the URL of a relevant web page).
    8   cbc:Keyword [0..*]    A keyword (search string) for this item, assigned by the seller party. Can also be a synonym for the name of the item.
    9   cbc:BrandName [0..*]    A brand name of this item.
    10  cbc:ModelName [0..*]    A model name of this item.
    11  cac:BuyersItemIdentification [0..1]    Identifying information for this item, assigned by the buyer.
    12  cac:SellersItemIdentification [0..1]    Identifying information for this item, assigned by the seller.
    13  cac:ManufacturersItemIdentification [0..*]    Identifying information for this item, assigned by the manufacturer.
    14  cac:StandardItemIdentification [0..1]    Identifying information for this item, assigned according to a standard system.
    15  cac:CatalogueItemIdentification [0..1]    Identifying information for this item, assigned according to a cataloguing system.
    16  cac:AdditionalItemIdentification [0..*]    An additional identifier for this item.
    17  cac:CatalogueDocumentReference [0..1]    A reference to the catalogue in which this item appears.
    18  cac:ItemSpecificationDocumentReference [0..*]    A reference to a specification document for this item.
    19  cac:OriginCountry [0..1]    The country of origin of this item.
    20  cac:CommodityClassification [0..*]    A classification of this item according to a specific system for classifying commodities.
    21  cac:TransactionConditions [0..*]    A set of sales conditions applying to this item.
    22  cac:HazardousItem [0..*]    Information pertaining to this item as a hazardous item.
    23  cac:ClassifiedTaxCategory [0..*]    A tax category applicable to this item.
    24  cac:AdditionalItemProperty [0..*]    An additional property of this item.
    25  cac:ManufacturerParty [0..*]    The manufacturer of this item.
    26  cac:InformationContentProviderParty [0..1]    The party responsible for specification of this item.
    27  cac:OriginAddress [0..*]    A region (not country) of origin of this item.
    28  cac:ItemInstance [0..*]    A trackable, unique instantiation of this item.
    29  cac:Certificate [0..*]    A certificate associated with this item.
    30  cac:Dimension [0..*]    One of the measurable dimensions (length, mass, weight, or volume) of this item.
*/

// ##################################  TODO CAC MISSING ################################################

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  transactionConditionses: {
    order: 21,
    attributeName: 'cac:TransactionConditions',
    max: undefined,
    classRef: () => TransactionConditions,
  },
  hazardousItems: { order: 22, attributeName: 'cac:HazardousItem', max: undefined, classRef: () => HazardousItem },
  additionalItemProperties: {
    order: 24,
    attributeName: 'cac:AdditionalItemProperty',
    max: undefined,
    classRef: () => AdditionalItemProperty,
  },
  itemInstances: { order: 28, attributeName: 'cac:ItemInstance', max: undefined, classRef: () => ItemInstance },
  certificates: { order: 29, attributeName: 'cac:Certificate', max: undefined, classRef: () => Certificate },
  dimensions: { order: 30, attributeName: 'cac:Dimension', max: undefined, classRef: () => Dimension },
  descriptions: { order: 1, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
  packQuantity: { order: 2, attributeName: 'cbc:PackQuantity', max: 1, classRef: UdtQuantity },
  packSizeNumeric: { order: 3, attributeName: 'cbc:PackSizeNumeric', max: 1, classRef: UdtNumeric },
  catalogueIndicator: { order: 4, attributeName: 'cbc:CatalogueIndicator', max: 1, classRef: UdtIndicator },
  name: { order: 5, attributeName: 'cbc:Name', max: 1, classRef: UdtName },
  hazardousRiskIndicator: {
    order: 6,
    attributeName: 'cbc:HazardousRiskIndicator',
    max: 1,
    classRef: UdtIndicator,
  },
  additionalInformations: {
    order: 7,
    attributeName: 'cbc:AdditionalInformation',
    max: undefined,
    classRef: UdtText,
  },
  keywords: { order: 8, attributeName: 'cbc:Keyword', max: undefined, classRef: UdtText },
  brandName: { order: 9, attributeName: 'cbc:BrandName', max: undefined, classRef: UdtName },
  modelName: { order: 10, attributeName: 'cbc:ModelName', max: undefined, classRef: UdtName },
  buyersItemIdentification: {
    order: 11,
    attributeName: 'cac:BuyersItemIdentification',
    max: 1,
    classRef: () => SellersItemIdentification,
  },
  sellersItemIdentification: {
    order: 12,
    attributeName: 'cac:SellersItemIdentification',
    max: 1,
    classRef: () => SellersItemIdentification,
  },
  manufacturersItemIdentifications: {
    order: 13,
    attributeName: 'cac:ManufacturersItemIdentification',
    max: undefined,
    classRef: () => SellersItemIdentification,
  },
  standardItemIdentification: {
    order: 14,
    attributeName: 'cac:StandardItemIdentification',
    max: 1,
    classRef: () => SellersItemIdentification,
  },
  catalogueItemIdentification: {
    order: 15,
    attributeName: 'cac:CatalogueItemIdentification',
    max: 1,
    classRef: () => SellersItemIdentification,
  },
  additionalItemIdentifications: {
    order: 16,
    attributeName: 'cac:AdditionalItemIdentification',
    max: undefined,
    classRef: () => SellersItemIdentification,
  },
  catalogueDocumentReference: {
    order: 17,
    attributeName: 'cac:CatalogueDocumentReference',
    max: 1,
    classRef: () => DocumentReference,
  },
  itemSpecificationDocumentReferences: {
    order: 18,
    attributeName: 'cac:ItemSpecificationDocumentReference',
    max: undefined,
    classRef: () => DocumentReference,
  },
  originCountry: {
    order: 19,
    attributeName: 'cac:OriginCountry',
    max: 1,
    classRef: () => Country,
  },
  commodityClassification: {
    order: 20,
    attributeName: 'cac:CommodityClassification',
    max: undefined,
    classRef: () => CommodityClassification,
  },
  classifiedTaxCategory: {
    order: 23,
    attributeName: 'cac:ClassifiedTaxCategory',
    max: undefined,
    classRef: () => ClassifiedTaxCategory,
  },
  manufacturerParties: {
    order: 25,
    attributeName: 'cac:ManufacturerParty',
    max: undefined,
    classRef: () => Party,
  },
  informationContentProviderParty: {
    order: 26,
    attributeName: 'cac:InformationContentProviderParty',
    max: 1,
    classRef: () => Party,
  },
  originAddresses: {
    order: 27,
    attributeName: 'cac:OriginAddress',
    max: undefined,
    classRef: () => OriginAddress,
  },
  // ItemIdentificationType
};

// ##################################  TODO CAC MISSING ################################################
type AllowedParams = {
  /** A set of sales conditions applying to this item. */
  transactionConditionses?: TransactionConditions[];
  /** Information pertaining to this item as a hazardous item. */
  hazardousItems?: HazardousItem[];
  /** An additional property of this item. */
  additionalItemProperties?: AdditionalItemProperty[];
  /** A trackable, unique instantiation of this item. */
  itemInstances?: ItemInstance[];
  /** A certificate associated with this item. */
  certificates?: Certificate[];
  /** One of the measurable dimensions (length, mass, weight, or volume) of this item. */
  dimensions?: Dimension[];
  /** Identifying information for this item, assigned by the buyer. */
  buyersItemIdentification?: SellersItemIdentification;
  /** Identifying information for this item, assigned by the manufacturer. */
  manufacturersItemIdentifications?: SellersItemIdentification[];
  /** Identifying information for this item, assigned according to a standard system. */
  standardItemIdentification?: SellersItemIdentification;
  /** Identifying information for this item, assigned according to a cataloguing system. */
  catalogueItemIdentification?: SellersItemIdentification;
  /** An additional identifier for this item. */
  additionalItemIdentifications?: SellersItemIdentification[];
  /** A reference to the catalogue in which this item appears. */
  catalogueDocumentReference?: DocumentReference;
  /** A reference to a specification document for this item. */
  itemSpecificationDocumentReferences?: DocumentReference[];
  /** The manufacturer of this item. */
  manufacturerParties?: Party[];
  /** The party responsible for specification of this item. */
  informationContentProviderParty?: Party;
  /** A region (not country) of origin of this item. */
  originAddresses?: OriginAddress[];
  name?: string | UdtName;
  descriptions?: UdtText[];
  packQuantity?: string | UdtQuantity;
  packSizeNumeric?: string | UdtNumeric;
  catalogueIndicator?: string | UdtIndicator;
  hazardousRiskIndicator?: string | UdtIndicator;
  additionalInformations?: UdtText[];
  keywords?: UdtText[];
  brandName?: (string | UdtName)[];
  modelName?: (string | UdtName)[];
  sellersItemIdentification?: SellersItemIdentification;
  classifiedTaxCategory?: ClassifiedTaxCategory[];
  originCountry?: Country;
  commodityClassification?: CommodityClassification[];
};

/**
 *
 */
class ItemType extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:ItemType');
  }
}

export { ItemType as Item, AllowedParams as ItemTypeParams, ItemType as SupplyItem };
