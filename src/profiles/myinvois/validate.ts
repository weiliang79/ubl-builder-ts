import { XmlNode } from '../../core/xmlNode';
import { Invoice } from '../../documents';

/**
 * Offline checks for the MyInvois rules that a document can be measured
 * against without contacting LHDN.
 *
 * ## Why this exists
 *
 * Every other gate in this library checks a document against the UBL *schema*.
 * A schema-valid MyInvois document can still be rejected, and the two rejection
 * classes below both cost a round trip to LHDN to discover:
 *
 * 1. **A dropped attribute.** Roughly half the leaf values in a real invoice
 *    carry an attribute MyInvois requires — `currencyID`, `schemeID`, `listID`,
 *    `unitCode`, `listVersionID`. Scalar params accept a bare `string` as a
 *    shorthand for the `Udt*` classes, and a bare string carries no attributes,
 *    so `taxAmount: '0.00'` produces `<cbc:TaxAmount>0.00</cbc:TaxAmount>` — an
 *    amount with no currency. That is schema-valid and rejected on submission.
 *
 * 2. **An incoherent consolidated e-Invoice.** Supplying the General Public TIN
 *    as the buyer silently reclassifies the document, and four unrelated fields
 *    must change with it. Nothing in the document declares the intent, so
 *    getting one of them wrong is easy and the rejection names a different
 *    element than the one at fault — see {@link validateInvoice}.
 *
 * ## What it deliberately does NOT check
 *
 * Anything requiring LHDN's own state: whether a TIN exists, whether it matches
 * the credentials behind a submission (`Error05`), whether a referenced
 * document exists, whether the submission duplicates an earlier one. Those are
 * the API's job and cannot be answered here. Monetary totals are also out of
 * scope, deliberately — MyInvois deviates from EN 16931 on
 * `cbc:AllowanceTotalAmount`, the caller supplies the totals, and LHDN is the
 * arbiter. See the note in `profile.ts`.
 *
 * The rule of admission is that a check must be *decidable from the document
 * alone* and must not produce a false positive on a document LHDN accepts. A
 * validator that blocks legitimate invoices is worse than no validator, because
 * the only workaround is to stop using it.
 */

/** The General Public TIN. Using it as the buyer makes the document consolidated. */
export const GENERAL_PUBLIC_TIN = 'EI00000000010';

/** `cbc:ItemClassificationCode` for a consolidated e-Invoice line. */
export const CONSOLIDATED_CLASSIFICATION_CODE = '004';

/** `cbc:CountrySubentityCode` meaning "Not Applicable". */
export const NOT_APPLICABLE_STATE_CODE = '17';

/** ISO 3166-1 alpha-3 for Malaysia — `MYS`, not `MY`. */
export const MALAYSIA = 'MYS';

/** One rule violation, located in the document. */
export interface ValidationIssue {
  /**
   * Stable identifier for the rule.
   *
   * LHDN's own code where this library has observed that rejection against the
   * live API (`CV317`); otherwise an `MYI…` code owned by this library.
   */
  readonly code: string;
  /** Where the fault is, e.g. `/Invoice/cac:InvoiceLine[2]/cac:Item/cbc:ItemClassificationCode`. */
  readonly path: string;
  /** What is wrong, in the terms a caller building the document would use. */
  readonly message: string;
  readonly expected?: string;
  readonly actual?: string;
}

/** Thrown by the profile's `finalize` hook when {@link validateInvoice} finds anything. */
export class MyInvoisValidationError extends Error {
  readonly issues: readonly ValidationIssue[];

  constructor(issues: readonly ValidationIssue[]) {
    const lines = issues.map((issue) => `  ${issue.code} at ${issue.path}: ${issue.message}`);
    super(`MyInvois validation failed with ${issues.length} issue(s):\n${lines.join('\n')}`);
    this.name = 'MyInvoisValidationError';
    this.issues = issues;
  }
}

/** An element paired with the path it sits at. */
interface Located {
  readonly node: XmlNode;
  readonly path: string;
}

/** Local name only, so a rule reads the same whether the prefix is `cbc:` or absent. */
const local = (name: string): string => (name.includes(':') ? name.slice(name.indexOf(':') + 1) : name);

const textOf = (node: Located | undefined): string | undefined =>
  node?.node.value === undefined ? undefined : String(node.node.value);

/**
 * Flatten the document, giving every element a path.
 *
 * Repeats are indexed from 1 (`cac:InvoiceLine[2]`) only when there is more
 * than one sibling of that name; a lone element keeps the plain path, which is
 * what a caller looking at their own source expects to see.
 */
function locate(root: XmlNode): Located[] {
  const out: Located[] = [];

  const visit = (node: XmlNode, path: string): void => {
    out.push({ node, path });

    const children = node.children ?? [];
    const counts = new Map<string, number>();
    children.forEach((child) => counts.set(child.name, (counts.get(child.name) ?? 0) + 1));

    const seen = new Map<string, number>();
    children.forEach((child) => {
      const index = (seen.get(child.name) ?? 0) + 1;
      seen.set(child.name, index);
      const suffix = (counts.get(child.name) ?? 0) > 1 ? `[${index}]` : '';
      visit(child, `${path}/${child.name}${suffix}`);
    });
  };

  visit(root, `/${root.name}`);
  return out;
}

/**
 * Attributes without which the element's value is ambiguous.
 *
 * The admission test is meaning, not the spec's "mandatory" column: each entry
 * below is an attribute whose absence leaves the value undecidable — an amount
 * with no currency, a code with no list to look it up in, an identifier that
 * could be a TIN or an NRIC. That criterion is what keeps this table free of
 * false positives, since a document missing one of these cannot be correct
 * under any reading.
 */
const REQUIRED_ATTRIBUTES: ReadonlyArray<{
  readonly matches: (element: Located, parent: Located | undefined) => boolean;
  readonly attributes: readonly string[];
  readonly why: string;
}> = [
  {
    // Covers every monetary element in UBL, `cbc:Amount` included.
    matches: (element) => local(element.node.name).endsWith('Amount'),
    attributes: ['currencyID'],
    why: 'an amount without a currency',
  },
  {
    matches: (element) => local(element.node.name) === 'InvoicedQuantity',
    attributes: ['unitCode'],
    why: 'a quantity without a unit of measure',
  },
  {
    matches: (element) => local(element.node.name) === 'ItemClassificationCode',
    attributes: ['listID'],
    why: 'a classification code with no list to resolve it against',
  },
  {
    matches: (element, parent) =>
      local(element.node.name) === 'IdentificationCode' && parent !== undefined && local(parent.node.name) === 'Country',
    attributes: ['listID', 'listAgencyID'],
    why: 'a country code with no list to resolve it against',
  },
  {
    matches: (element) => local(element.node.name) === 'InvoiceTypeCode',
    attributes: ['listVersionID'],
    // Load-bearing: it is how LHDN decides whether to run signature validation.
    why: 'no document version, so LHDN cannot tell 1.0 from 1.1',
  },
  {
    matches: (element, parent) =>
      local(element.node.name) === 'ID' && parent !== undefined && local(parent.node.name) === 'PartyIdentification',
    attributes: ['schemeID'],
    why: 'an identifier that could be a TIN, an NRIC or a tax registration',
  },
];

/** Index every element by its parent, so a rule can ask what an element sits inside. */
function parentsOf(located: readonly Located[]): Map<XmlNode, Located> {
  const parents = new Map<XmlNode, Located>();
  located.forEach((entry) => (entry.node.children ?? []).forEach((child) => parents.set(child, entry)));
  return parents;
}

/** The first element at `path`, matched on local names so prefixes do not matter. */
function at(located: readonly Located[], ...names: readonly string[]): Located | undefined {
  return located.find((entry) => {
    const segments = entry.path.split('/').slice(1);
    if (segments.length !== names.length + 1) return false;
    return names.every((name, index) => local(segments[index + 1].replace(/\[\d+]$/, '')) === name);
  });
}

/** Every element with this local name, anywhere in the document. */
function every(located: readonly Located[], name: string): Located[] {
  return located.filter((entry) => local(entry.node.name) === name);
}

/** The value of a party's `schemeID="TIN"` identifier, if it has one. */
function tinOf(located: readonly Located[], party: 'AccountingSupplierParty' | 'AccountingCustomerParty'): string | undefined {
  // Matched on path substrings rather than exact segments because the prefix
  // is not fixed: `Invoice.fromXml` preserves whatever the source document
  // used, so the segment may be `cac:AccountingSupplierParty` or bare.
  const identifier = located.find(
    (entry) =>
      local(entry.node.name) === 'ID' &&
      entry.path.includes(party) &&
      entry.path.includes('PartyIdentification') &&
      entry.node.attributes?.schemeID === 'TIN',
  );
  return textOf(identifier);
}

/**
 * Check a document against the MyInvois rules decidable offline.
 *
 * Returns every issue found rather than throwing on the first, and rather than
 * stopping at the first *kind* of issue. That is a direct lesson from the live
 * API: LHDN reported an `ERR205` against
 * `AccountingCustomerParty.Party.PartyIdentification.ID` for a document whose
 * fault was in the postal address and the item classification code. The field
 * its `propertyPath` named was never wrong, and fixing one error at a time led
 * nowhere. A caller needs the whole set.
 *
 * @returns the issues found, empty when the document passes.
 */
export function validateInvoice(invoice: Invoice): ValidationIssue[] {
  const located = locate(invoice.toNode());
  const parents = parentsOf(located);
  const issues: ValidationIssue[] = [];

  // ---- Attributes whose absence makes a value ambiguous -------------------
  located.forEach((element) => {
    const parent = parents.get(element.node);
    REQUIRED_ATTRIBUTES.filter((rule) => rule.matches(element, parent)).forEach((rule) => {
      rule.attributes
        .filter((attribute) => element.node.attributes?.[attribute] === undefined)
        .forEach((attribute) =>
          issues.push({
            code: 'MYI001',
            path: element.path,
            message: `missing @${attribute} — ${rule.why}. Pass a Udt* instance with attributes rather than a bare string.`,
            expected: `@${attribute}`,
          }),
        );
    });
  });

  // ---- Every party needs a TIN -------------------------------------------
  (['AccountingSupplierParty', 'AccountingCustomerParty'] as const).forEach((party) => {
    if (tinOf(located, party) === undefined) {
      issues.push({
        code: 'MYI002',
        path: `/Invoice/cac:${party}/cac:Party/cac:PartyIdentification/cbc:ID`,
        message: 'no identifier with schemeID="TIN". MyInvois identifies both parties by TIN.',
        expected: 'schemeID="TIN"',
      });
    }
  });

  // ---- Consolidated e-Invoice coherence ----------------------------------
  //
  // Nothing in the document declares that it is consolidated; supplying the
  // General Public TIN as the buyer is what decides it, and several unrelated
  // fields must agree with that choice. Both directions are checked, because
  // each value is wrong in the other mode.
  const consolidated = tinOf(located, 'AccountingCustomerParty') === GENERAL_PUBLIC_TIN;

  const buyerState = at(
    located,
    'AccountingCustomerParty',
    'Party',
    'PostalAddress',
    'CountrySubentityCode',
  );
  const buyerCountry = at(
    located,
    'AccountingCustomerParty',
    'Party',
    'PostalAddress',
    'Country',
    'IdentificationCode',
  );
  const state = textOf(buyerState);

  if (consolidated && state !== NOT_APPLICABLE_STATE_CODE) {
    issues.push({
      code: 'CV317',
      path: buyerState?.path ?? '/Invoice/cac:AccountingCustomerParty/cac:Party/cac:PostalAddress/cbc:CountrySubentityCode',
      message:
        'a consolidated e-Invoice (General Public buyer) must use state code 17. The rest of the buyer address should be "NA" too.',
      expected: NOT_APPLICABLE_STATE_CODE,
      actual: state,
    });
  }

  if (!consolidated && state === NOT_APPLICABLE_STATE_CODE && textOf(buyerCountry) === MALAYSIA) {
    // LHDN's wording: "State Code 17 should be used for Consolidated e-Invoice
    // and non-Malaysian address only". A non-Malaysian address is exempt, which
    // is why this is guarded on the country code.
    issues.push({
      code: 'CV317',
      path: buyerState?.path ?? '',
      message:
        'state code 17 is only for a consolidated e-Invoice or a non-Malaysian address. Use the buyer’s real state code.',
      actual: state,
    });
  }

  every(located, 'ItemClassificationCode').forEach((element) => {
    const code = textOf(element);
    if (consolidated && code !== CONSOLIDATED_CLASSIFICATION_CODE) {
      issues.push({
        code: 'MYI003',
        path: element.path,
        message: 'every line of a consolidated e-Invoice must be classified 004.',
        expected: CONSOLIDATED_CLASSIFICATION_CODE,
        actual: code,
      });
    }
    if (!consolidated && code === CONSOLIDATED_CLASSIFICATION_CODE) {
      issues.push({
        code: 'MYI003',
        path: element.path,
        message: 'classification 004 is reserved for consolidated e-Invoices, whose buyer is the General Public TIN.',
        actual: code,
      });
    }
  });

  return issues;
}

/** Run {@link validateInvoice} and throw if it finds anything. */
export function assertValidInvoice(invoice: Invoice): void {
  const issues = validateInvoice(invoice);
  if (issues.length > 0) throw new MyInvoisValidationError(issues);
}
