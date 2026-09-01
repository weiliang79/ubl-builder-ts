import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtAmount, UdtIdentifier } from '../datatypes/udt';
import { AllowanceCharge } from './AllowanceCharge';

/**
 * cac:BillingReferenceLineType
 *
 * Generated from the OASIS UBL 2.1 schemas by `npm run scaffold`. Every field,
 * its sequence position, its cardinality and the class it is built into come
 * from cac:BillingReferenceLineType; check:schema, check:types and check:classref hold this file to
 * that same schema.
 */
const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  amount: { order: 2, attributeName: 'cbc:Amount', max: 1, classRef: UdtAmount },
  allowanceCharges: { order: 3, attributeName: 'cac:AllowanceCharge', max: undefined, classRef: () => AllowanceCharge },
};

type AllowedParams = {
  /** An identifier for this transaction line in a billing document. */
  id: string | UdtIdentifier;
  /** The monetary amount of the transaction line, including any allowances and charges but excluding taxes. */
  amount?: string | UdtAmount;
  /** An allowance or charge applicable to the transaction line. */
  allowanceCharges?: AllowanceCharge[];
};

class BillingReferenceLine extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:BillingReferenceLine');
  }
}

export { BillingReferenceLine, AllowedParams as BillingReferenceLineParams };
