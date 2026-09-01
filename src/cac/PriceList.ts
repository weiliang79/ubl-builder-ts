import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier } from '../datatypes/udt';
import { ValidityPeriod } from './Period';

/*
    http://www.datypic.com/sc/ubl21/t-cac_PriceListType.html
  1  cbc:ID [0..1]    An identifier for this price list.
  2  cbc:StatusCode [0..1]    A code signifying whether this price list is an original, copy, revision, or cancellation.
  3  cac:ValidityPeriod [0..*]    A period during which this price list is valid.
  4  cac:PreviousPriceList [0..1]    The previous price list.
*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  previousPriceList: { order: 4, attributeName: 'cac:PreviousPriceList', max: 1, classRef: () => PriceList },
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  statusCode: { order: 2, attributeName: 'cbc:StatusCode', max: 1, classRef: UdtCode },
  validityPeriods: {
    order: 3,
    attributeName: 'cac:ValidityPeriod',
    max: undefined,
    classRef: () => ValidityPeriod,
  },

  // ##################################  TODO CAC MISSING ################################################
};

type AllowedParams = {
  /** The previous price list. */
  previousPriceList?: PriceList;
  id?: string | UdtIdentifier;
  statusCode?: string | UdtCode;
  validityPeriods?: ValidityPeriod[];
};

/**
 *
 */
class PriceList extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:PriceList');
  }
}

export { PriceList, AllowedParams as PriceListParams };
