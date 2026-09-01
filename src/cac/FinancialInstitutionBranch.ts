import GenericAggregateComponent, { IGenericKeyValue, ParamsMapValues } from '../core/GenericAggregateComponent';
import { UdtIdentifier, UdtName } from '../datatypes/udt';
import { PostalAddress } from './Address';
import { FinancialInstitution } from './FinancialInstitution';

const ParamsMap: IGenericKeyValue<ParamsMapValues> = {
  id: { order: 1, attributeName: 'cbc:ID', max: 1, classRef: UdtIdentifier },
  name: { order: 2, attributeName: 'cbc:Name', max: 1, classRef: UdtName },
  financialInstitution: {
    order: 3,
    attributeName: 'cac:FinancialInstitution',
    max: 1,
    classRef: () => FinancialInstitution,
  },
  address: { order: 4, attributeName: 'cac:Address', max: 1, classRef: () => PostalAddress },
};

type AllowedParams = {
  /** The name of this branch or division of an organization. */
  name?: string | UdtName;
  /** The financial institution that this branch belongs to (if applicable). */
  financialInstitution?: FinancialInstitution;
  /** The address of this branch or division. */
  address?: PostalAddress;
  id?: string | UdtIdentifier;
};

/**
 *
 */
class FinancialInstitutionBranch extends GenericAggregateComponent {
  constructor(content: AllowedParams) {
    super(content, ParamsMap, 'cac:FinancialInstitutionBranch');
  }
}

export { FinancialInstitutionBranch, AllowedParams as FinancialInstitutionBranchParams };
