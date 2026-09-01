import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtDate, UdtIdentifier, UdtTime } from '../datatypes/udt';
import { UdtAmount } from '../datatypes/udt/UdtAmount';

/*
  1  cbc:ID [0..1]    An identifier for this payment.
  2  cbc:PaidAmount [0..1]    The amount of this payment.
  3  cbc:ReceivedDate [0..1]    The date on which this payment was received.
  4  cbc:PaidDate [0..1]    The date on which this payment was made.
  5  cbc:PaidTime [0..1]    The time at which this payment was made.
  6  cbc:InstructionID [0..1]    An identifier for the payment instruction.
*/

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  paidAmount: { order: 2, attributeName: 'cbc:PaidAmount', max: 1, classRef: UdtAmount },
  receivedDate: { order: 3, attributeName: 'cbc:ReceivedDate', max: 1, classRef: UdtDate },
  paidDate: { order: 4, attributeName: 'cbc:PaidDate', max: 1, classRef: UdtDate },
  paidTime: { order: 5, attributeName: 'cbc:PaidTime', max: 1, classRef: UdtTime },
  instructionID: { order: 6, attributeName: 'cbc:InstructionID', max: 1, classRef: UdtIdentifier },
};

type AllowedParams = {
  id?: string | UdtIdentifier;
  paidAmount?: string | UdtAmount;
  receivedDate?: string | UdtDate;
  paidDate?: string | UdtDate;
  paidTime?: string | UdtTime;
  instructionID?: string | UdtIdentifier;
};

/**
 *
 */
class PaymentType extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:PaymentType');
  }
}

export { PaymentType, AllowedParams as PaymentTypeParams, PaymentType as PrepaidPayment };
