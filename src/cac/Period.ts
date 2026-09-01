import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtCode, UdtDate, UdtMeasure, UdtText, UdtTime } from '../datatypes/udt';

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  startDate: { order: 1, attributeName: 'cbc:StartDate', max: 1, classRef: UdtDate },
  startTime: { order: 2, attributeName: 'cbc:StartTime', max: 1, classRef: UdtTime },
  endDate: { order: 3, attributeName: 'cbc:EndDate', max: 1, classRef: UdtDate },
  endTime: { order: 4, attributeName: 'cbc:EndTime', max: 1, classRef: UdtTime },
  durationMeasure: { order: 5, attributeName: 'cbc:DurationMeasure', max: 1, classRef: UdtMeasure },
  descriptionCode: { order: 6, attributeName: 'cbc:DescriptionCode', max: undefined, classRef: UdtCode },
  description: { order: 7, attributeName: 'cbc:Description', max: undefined, classRef: UdtText },
};

type AllowedParams = {
  /** The date on which this period begins. */
  startDate?: string | UdtDate;
  /** The time at which this period begins */
  startTime?: string | UdtTime;
  /** The date on which this period ends */
  endDate?: string | UdtDate;
  /** The time at which this period ends */
  endTime?: string | UdtTime;
  /** The duration of this period, expressed as an ISO 8601 code. */
  durationMeasure?: string | UdtMeasure;
  /** A description of this period, expressed as a code. */
  descriptionCode?: (string | UdtCode)[];
  /** A description of this period, expressed as text. */
  description?: (string | UdtText)[];
};

// /* eslint max-classes-per-file: ["error", 2] */
/* tslint:disable:max-classes-per-file */

class PeriodType extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:InvoicePeriod');
  }

  /** The date on which this period begins. */
  setStartDate(value: string | UdtDate) {
    this.attributes.startDate = value instanceof UdtDate ? value : new UdtDate(value);
    return this;
  }

  /** Alias of {@link setStartDate}; a period has at most one start date. */
  addStartDate(value: string | UdtDate) {
    return this.setStartDate(value);
  }

  /** The date on which this period ends. */
  setEndDate(value: string | UdtDate) {
    this.attributes.endDate = value instanceof UdtDate ? value : new UdtDate(value);
    return this;
  }

  /** Alias of {@link setEndDate}; a period has at most one end date. */
  addEndDate(value: string | UdtDate) {
    return this.setEndDate(value);
  }
}

class InvoicePeriodBasic extends PeriodType {
  constructor(startDate: string | UdtDate, endDate: string | UdtDate) {
    super({ startDate, endDate });
  }
}

export {
  PeriodType as EstimatedDeliveryPeriod,
  PeriodType as EstimatedDespatchPeriod,
  InvoicePeriodBasic,
  PeriodType,
  AllowedParams as PeriodTypeParams,
  PeriodType as PromisedDeliveryPeriod,
  PeriodType as RequestedDeliveryPeriod,
  PeriodType as RequestedDespatchPeriod,
  PeriodType as ValidityPeriod,
};
