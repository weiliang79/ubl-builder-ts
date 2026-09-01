import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtIdentifier, UdtText } from '../datatypes/udt';
import { UdtAmount } from '../datatypes/udt/UdtAmount';
import { AllowanceCharge } from './AllowanceCharge';
import { DeliveryLocation } from './Location';
/*

  1    cbc:ID [0..1]    An identifier for this description of delivery terms.
  2    cbc:SpecialTerms [0..*]    A description of any terms or conditions relating to the delivery items.
  3    cbc:LossRiskResponsibilityCode [0..1]    A code that identifies one of various responsibilities for loss risk in the execution of the delivery.
  4    cbc:LossRisk [0..*]    A description of responsibility for risk of loss in execution of the delivery, expressed as text.
  5    cbc:Amount [0..1]    The monetary amount covered by these delivery terms.
  6    cac:DeliveryLocation [0..1]    The location for the contracted delivery.
  7    cac:AllowanceCharge [0..1]    An allowance or charge covered by these delivery terms.

*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  allowanceCharge: { order: 7, attributeName: 'cac:AllowanceCharge', max: 1, classRef: AllowanceCharge },
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  specialTerms: { order: 2, attributeName: 'cbc:SpecialTerms', max: undefined, classRef: UdtText },
  lossRiskResponsibilityCode: {
    order: 3,
    attributeName: 'cbc:LossRiskResponsibilityCode',
    max: 1,
    classRef: UdtCode,
  },
  lossRisks: { order: 4, attributeName: 'cbc:LossRisk', max: undefined, classRef: UdtText },
  amount: { order: 5, attributeName: 'cbc:Amount', max: 1, classRef: UdtAmount },
  deliveryLocation: {
    order: 6,
    attributeName: 'cac:DeliveryLocation',
    max: 1,
    classRef: () => DeliveryLocation,
  },

  // ##################################  TODO CAC MISSING ################################################
};

type AllowedParams = {
  /** An allowance or charge covered by these delivery terms. */
  allowanceCharge?: AllowanceCharge;
  id?: string | UdtIdentifier;
  specialTerms?: string[] | UdtText[];
  lossRiskResponsibilityCode?: string | UdtCode;
  lossRisks?: string[] | UdtText[];
  amount?: string | UdtAmount;
  deliveryLocation?: DeliveryLocation;
};

/**
 *
 */
class DeliveryTerms extends GenericAggregateComponent {
  /**
   * @param {AllowedParams} content
   * @param {string} name
   */
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:DeliveryTerms');
  }
}

export { DeliveryTerms, AllowedParams as DeliveryTermsParams };
