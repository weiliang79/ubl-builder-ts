import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode } from '../datatypes/udt';

/*
    cbc:ItemClassificationCode [1..1]  A code signifying the classification of the item
*/
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  natureCode: { order: 1, attributeName: 'cbc:NatureCode', max: 1, classRef: UdtCode },
  cargoTypeCode: { order: 2, attributeName: 'cbc:CargoTypeCode', max: 1, classRef: UdtCode },
  commodityCode: { order: 3, attributeName: 'cbc:CommodityCode', max: 1, classRef: UdtCode },
  itemClassificationCode: {
    order: 4,
    attributeName: 'cbc:ItemClassificationCode',
    max: 1,
    classRef: UdtCode,
  },
};

type AllowedParams = {
  /** A code defined by a specific maintenance agency signifying the high-level nature of the commodity. */
  natureCode?: string | UdtCode;
  /** A mutually agreed code signifying the type of cargo for purposes of commodity classification. */
  cargoTypeCode?: string | UdtCode;
  /** The harmonized international commodity code for cross border and regulatory (customs and trade statistics) purposes. */
  commodityCode?: string | UdtCode;
  itemClassificationCode?: string | UdtCode;
};

class CommodityClassification extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   */
  constructor(content?: AllowedParams) {
    super(content, ParamsMap, 'cac:CommodityClassification');
  }
}

export { CommodityClassification, AllowedParams as CommodityClassificationParams };
