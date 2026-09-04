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

/**
 * `cbc:CountrySubentityCode` meaning "Not Applicable".
 *
 * Informational only — nothing in this file requires it. 0.4.0 did, on a
 * consolidated e-Invoice, and LHDN accepts a real state code there instead. It
 * stays exported because it is a true MyInvois code and removing an export in a
 * patch release would break callers, not because using it is necessary.
 */
export const NOT_APPLICABLE_STATE_CODE = '17';

/** One rule violation, located in the document. */
export interface ValidationIssue {
  /**
   * Stable identifier for the rule.
   *
   * An `MYI…` code owned by this library. LHDN's own codes were used where a
   * rejection had been observed, but the only one that ever qualified —
   * `CV317` — turned out to name a rule LHDN does not have, so none remain.
   * Borrow one again only for a rule isolated by a single-variable
   * submission.
   */
  readonly code: string;
  /** Where the fault is, e.g. `/Invoice/cac:InvoiceLine[2]/cac:Item/cbc:ItemClassificationCode`. */
  readonly path: string;
  /** What is wrong, in the terms a caller building the document would use. */
  readonly message: string;
  readonly expected?: string;
  readonly actual?: string;
}

/**
 * The verdict on a document.
 *
 * Shaped like LHDN's own response — which reports a `status` alongside its
 * `validationSteps` — so a caller can handle the offline verdict and the API's
 * with the same code instead of unwrapping an array in one place and a status
 * object in the other. `valid` is derivable from `issues.length`; the small
 * redundancy buys that symmetry.
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
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
 * The children of an element, each with its own path.
 *
 * Repeats are indexed from 1 (`cac:InvoiceLine[2]`) only when there is more
 * than one sibling of that name; a lone element keeps the plain path, which is
 * what a caller looking at their own source expects to see.
 */
function childrenOf(entry: Located): Located[] {
  const children = entry.node.children ?? [];
  const counts = new Map<string, number>();
  children.forEach((child) => counts.set(child.name, (counts.get(child.name) ?? 0) + 1));

  const seen = new Map<string, number>();
  return children.map((child) => {
    const index = (seen.get(child.name) ?? 0) + 1;
    seen.set(child.name, index);
    const suffix = (counts.get(child.name) ?? 0) > 1 ? `[${index}]` : '';
    return { node: child, path: `${entry.path}/${child.name}${suffix}` };
  });
}

/** Flatten the document, giving every element a path. */
function locate(root: XmlNode): Located[] {
  const out: Located[] = [];
  const visit = (entry: Located): void => {
    out.push(entry);
    childrenOf(entry).forEach(visit);
  };
  visit({ node: root, path: `/${root.name}` });
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
 *
 * `cbc:InvoicedQuantity/@unitCode` was a candidate and is deliberately absent.
 * A quantity with no unit reads as ambiguous, but LHDN models Measurement as an
 * optional field in its own right, so a document omitting it is plausibly
 * accepted — and this table may not reject anything LHDN accepts. An observed
 * rejection would be enough to add it; the reasoning is not.
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
    matches: (element) => local(element.node.name) === 'ItemClassificationCode',
    attributes: ['listID'],
    why: 'a classification code with no list to resolve it against',
  },
  {
    matches: (element, parent) =>
      local(element.node.name) === 'IdentificationCode' &&
      parent !== undefined &&
      local(parent.node.name) === 'Country',
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

/**
 * Elements MyInvois requires on every document type.
 *
 * Admitted by evidence, not by reading the spec's "mandatory" column: each one
 * is present in BOTH documents this repo knows LHDN accepted — the production
 * fixture and LHDN's own published signed sample. Anything absent from either
 * is excluded, which is how `cbc:ElectronicMail` was ruled out.
 *
 * Three candidates present in both are still excluded, because appearing in two
 * documents is not evidence of being required: `cbc:PostalZone`,
 * `cbc:TaxCurrencyCode` and `cbc:InvoicedQuantity` are all modelled by LHDN as
 * optional fields in their own right, so requiring them could reject a document
 * LHDN accepts.
 *
 * Scoped to what every Invoice type needs. Credit, debit and refund notes also
 * require `cac:BillingReference` naming the original, and the self-billed types
 * (11–14) swap which party carries what; neither is checked here, because this
 * project has submitted neither and a guess would cost more than it saves.
 *
 * `leaf` entries must additionally carry a non-empty value. That catches the
 * library's one silent failure mode: a plain object passed where a component
 * instance is required emits an EMPTY element rather than raising, so
 * `partyLegalEntities: [{ registrationName: 'X' }]` yields
 * `<cac:PartyLegalEntity/>` and loses the name without a word.
 */
interface Requirement {
  /** Local names from the element the rule is rooted at. */
  readonly names: readonly string[];
  /** What is missing, phrased as the caller would name it. */
  readonly label: string;
  /** Require a non-empty value, not merely the element. */
  readonly leaf?: boolean;
}

const DOCUMENT_REQUIREMENTS: readonly Requirement[] = [
  { names: ['ID'], label: 'the e-Invoice number', leaf: true },
  { names: ['IssueDate'], label: 'the issue date', leaf: true },
  { names: ['IssueTime'], label: 'the issue time (UTC — LHDN renders it as MYT)', leaf: true },
  { names: ['InvoiceTypeCode'], label: 'the document type code', leaf: true },
  { names: ['DocumentCurrencyCode'], label: 'the document currency', leaf: true },
  { names: ['AccountingSupplierParty'], label: 'the supplier' },
  { names: ['AccountingCustomerParty'], label: 'the buyer' },
  { names: ['TaxTotal'], label: 'the document-level tax total' },
  { names: ['LegalMonetaryTotal'], label: 'the document totals' },
  { names: ['InvoiceLine'], label: 'at least one invoice line' },
];

/** Required of both the supplier and the buyer. */
const PARTY_REQUIREMENTS: readonly Requirement[] = [
  { names: ['Party', 'PartyLegalEntity', 'RegistrationName'], label: 'the name', leaf: true },
  { names: ['Party', 'PostalAddress', 'CityName'], label: 'the city', leaf: true },
  { names: ['Party', 'PostalAddress', 'CountrySubentityCode'], label: 'the state code', leaf: true },
  { names: ['Party', 'PostalAddress', 'AddressLine', 'Line'], label: 'an address line', leaf: true },
  { names: ['Party', 'PostalAddress', 'Country', 'IdentificationCode'], label: 'the country code', leaf: true },
  { names: ['Party', 'Contact', 'Telephone'], label: 'a contact number', leaf: true },
];

/** Required of the supplier alone. */
const SUPPLIER_REQUIREMENTS: readonly Requirement[] = [
  { names: ['Party', 'IndustryClassificationCode'], label: 'the MSIC code', leaf: true },
];

/** Required of every invoice line. */
const LINE_REQUIREMENTS: readonly Requirement[] = [
  { names: ['ID'], label: 'a line number', leaf: true },
  { names: ['LineExtensionAmount'], label: 'the line subtotal', leaf: true },
  { names: ['Item', 'Description'], label: 'a description', leaf: true },
  { names: ['Item', 'CommodityClassification', 'ItemClassificationCode'], label: 'a classification code', leaf: true },
  { names: ['Price', 'PriceAmount'], label: 'a unit price', leaf: true },
  { names: ['ItemPriceExtension', 'Amount'], label: 'the amount excluding tax', leaf: true },
  { names: ['TaxTotal'], label: 'a tax total' },
];

/**
 * The conventional path for an element that is not there.
 *
 * A missing element has no name to read, so the prefix comes from UBL's own
 * split: aggregates live in CommonAggregateComponents, leaf values in
 * CommonBasicComponents. Without this the reported path would mix prefixed and
 * bare segments and stop being something a caller can search their source for.
 */
const qualify = (names: readonly string[], leaf: boolean): string =>
  names.map((name, index) => `${leaf && index === names.length - 1 ? 'cbc' : 'cac'}:${name}`).join('/');

/** Check one requirement below `root`, reporting at most one issue. */
function checkRequirement(root: Located, requirement: Requirement, describe: string): ValidationIssue | undefined {
  const found = under(root, requirement.names);
  const satisfied = requirement.leaf
    ? found.some((entry) => entry.node.value !== undefined && String(entry.node.value) !== '')
    : found.length > 0;
  if (satisfied) return undefined;

  const path = qualify(requirement.names, requirement.leaf === true);
  return {
    code: 'MYI004',
    path: `${root.path}/${path}`,
    message: `${describe} is missing ${requirement.label}.`,
    expected: path.slice(path.lastIndexOf('/') + 1),
  };
}

/** Index every element by its parent, so a rule can ask what an element sits inside. */
function parentsOf(located: readonly Located[]): Map<XmlNode, Located> {
  const parents = new Map<XmlNode, Located>();
  located.forEach((entry) => (entry.node.children ?? []).forEach((child) => parents.set(child, entry)));
  return parents;
}

/**
 * Every element sitting at exactly `names` below `root`.
 *
 * Matched on local names so a prefix is irrelevant, and on exact depth so
 * `PostalAddress/CityName` cannot be satisfied by a `CityName` nested deeper —
 * MyInvois documents carry more than one party, and a rule about the supplier's
 * address must not be answered by a delivery address.
 *
 * It descends the subtree rather than filtering the flattened document, which
 * is not a micro-optimisation: the flat scan made validation quadratic in line
 * count, because every requirement of every line searched the whole document.
 * A 500-line consolidated invoice took 1.5 seconds.
 */
function under(root: Located, names: readonly string[]): Located[] {
  let level = [root];
  for (const name of names) {
    const next: Located[] = [];
    level.forEach((entry) =>
      childrenOf(entry).forEach((child) => {
        if (local(child.node.name) === name) next.push(child);
      }),
    );
    if (next.length === 0) return [];
    level = next;
  }
  return level;
}

/** The first element at `names` below `root`. */
function at(root: Located, ...names: readonly string[]): Located | undefined {
  return under(root, names)[0];
}

/** Every element with this local name, anywhere in the document. */
function allNamed(located: readonly Located[], name: string): Located[] {
  return located.filter((entry) => local(entry.node.name) === name);
}

/** The value of a party's `schemeID="TIN"` identifier, if it has one. */
function tinOf(
  located: readonly Located[],
  party: 'AccountingSupplierParty' | 'AccountingCustomerParty',
): string | undefined {
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
 * @returns the verdict, with every issue found.
 */
export function validateInvoice(invoice: Invoice): ValidationResult {
  const located = locate(invoice.toNode());
  const root = located[0];
  const parents = parentsOf(located);
  const issues: ValidationIssue[] = [];

  // ---- Elements MyInvois requires at all -------------------------------
  //
  // Reported before anything else, because the checks that follow describe
  // elements that are present; a document missing half its fields should say
  // so rather than complain about an attribute on the half it has.
  DOCUMENT_REQUIREMENTS.forEach((requirement) => {
    const issue = checkRequirement(root, requirement, 'the document');
    if (issue) issues.push(issue);
  });

  (
    [
      ['AccountingSupplierParty', 'the supplier'],
      ['AccountingCustomerParty', 'the buyer'],
    ] as const
  ).forEach(([name, describe]) => {
    const party = at(root, name);
    if (!party) return; // already reported as missing outright
    const rules =
      name === 'AccountingSupplierParty' ? [...PARTY_REQUIREMENTS, ...SUPPLIER_REQUIREMENTS] : PARTY_REQUIREMENTS;
    rules.forEach((requirement) => {
      const issue = checkRequirement(party, requirement, describe);
      if (issue) issues.push(issue);
    });
  });

  under(root, ['InvoiceLine']).forEach((line, index) => {
    LINE_REQUIREMENTS.forEach((requirement) => {
      const issue = checkRequirement(line, requirement, `invoice line ${index + 1}`);
      if (issue) issues.push(issue);
    });
  });

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
    // Guarded: a party that is not there at all has already been reported, and
    // saying "and it has no TIN" about a party that does not exist is noise.
    if (at(root, party) === undefined) return;
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
  // General Public TIN as the buyer is what decides it, and the item
  // classification code must agree with that choice. That classification code
  // is the ONLY thing checked here — in particular the buyer's state code is
  // not, and 0.4.0 was wrong to check it.
  //
  // 0.4.0 reported `CV317` when a consolidated document's buyer state code was
  // not 17. LHDN accepted such a document — General Public TIN, state code 14,
  // classification 004, `Step04-Code Field Validator: Valid`, which is the step
  // that emits `CV317`. The rule named something LHDN does not enforce.
  //
  // The mistake is kept in view because its shape recurs. The rule came from a
  // real `CV317` rejection, but that submission differed from the accepted one
  // in TWO places at once — the buyer address AND the classification code — and
  // the wrong one was credited. `ERR205` in the same response named a
  // `PartyIdentification` that was never at fault, for the same reason: an
  // error's `propertyPath` says where the failing rule was reading, not what is
  // wrong. So a rule earns its place from a submission that changed ONE thing.
  const consolidated = tinOf(located, 'AccountingCustomerParty') === GENERAL_PUBLIC_TIN;

  allNamed(located, 'ItemClassificationCode').forEach((element) => {
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
    // NOT observed, unlike the branch above. That one is isolated: with the
    // state code now known to be irrelevant, the classification is the only
    // thing that separated the rejected 2026-09-03 submission from the accepted
    // one. This direction rests on the code list defining 004 as "Consolidated
    // e-Invoice" and on the user stating the constraint — documentation, not a
    // rejection. It is exactly the standing the removed `CV317` reverse half
    // had, and it is kept only because misusing 004 on a named-buyer invoice is
    // implausible as an accident. One deliberate submission would settle it;
    // until then, this is the first rule to suspect if a valid document is
    // refused.
    if (!consolidated && code === CONSOLIDATED_CLASSIFICATION_CODE) {
      issues.push({
        code: 'MYI003',
        path: element.path,
        message: 'classification 004 is reserved for consolidated e-Invoices, whose buyer is the General Public TIN.',
        actual: code,
      });
    }
  });

  return { valid: issues.length === 0, issues };
}

/** Run {@link validateInvoice} and throw if it finds anything. */
export function assertValidInvoice(invoice: Invoice): void {
  const { valid, issues } = validateInvoice(invoice);
  if (!valid) throw new MyInvoisValidationError(issues);
}
