# ubl-builder

[![license: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)

Build XML documents to the OASIS **UBL 2.1** (Universal Business Language)
standard, with optional country profiles layered on top.

- **Every UBL 2.1 aggregate component** — all 109, held to the OASIS schemas by
  CI checks that fail on any disagreement in element name, sequence position,
  cardinality or the class a value is built into
- **XML or JSON** — the same document renders as XML or as OASIS UBL JSON
  v2.0, the format Malaysia's MyInvois accepts alongside XML
- **Country profiles** — the core knows only UBL; jurisdictions add their
  vocabulary and derived values behind a small interface

**UBL 2.1 documentation:** <https://docs.oasis-open.org/ubl/os-UBL-2.1/UBL-2.1.html>
**UBL 2.1 schema reference:** <https://www.datypic.com/sc/ubl21/ss.html>

## Install

```sh
npm install @weiliang79/ubl-builder
```

Requires **Node 20 or newer**. Digests are computed with Web Crypto through the
`crypto` global, which Node exposes by default only from version 19.

## Usage

```ts
import { Invoice } from '@weiliang79/ubl-builder/documents';
import { myInvois } from '@weiliang79/ubl-builder/profiles/myinvois';

const invoice = new Invoice('INV-0001');

myInvois.defaults(invoice); // namespace declarations for the profile
invoice.setIssueDate('2026-07-02').setIssueTime('02:02:36Z').setDocumentCurrencyCode('MYR');

console.log(invoice.getXml(true));
```

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Invoice
    xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>INV-0001</cbc:ID>
  <cbc:IssueDate>2026-07-02</cbc:IssueDate>
  <cbc:IssueTime>02:02:36Z</cbc:IssueTime>
  <cbc:DocumentCurrencyCode>MYR</cbc:DocumentCurrencyCode>
</Invoice>
```

The namespace declarations are wrapped here for readability; the real output
puts them on the root element's own line.

For submission, `getXml(false, true)` gives the headless single-line form whose
bytes the MyInvois `documentHash` is computed over. `getJson()` renders the
same document as UBL JSON.

## Reading a document back

`Invoice.fromXml` and `Invoice.fromJson` are the inverses. Both rebuild the
document from the same tables that write one, so a document read back renders
byte for byte as it arrived:

```ts
const invoice = Invoice.fromXml(receivedXml);
invoice.setDueDate('2026-08-01');
console.log(invoice.getXml(false, true));
```

One caveat for hashing: an empty element written `<x></x>` is re-serialised as
`<x/>`, so a `documentHash` taken over a re-serialised third-party document may
not match the sender's. Hash the bytes you received.

An element this library cannot represent throws rather than being dropped —
32 UBL children still have no component class, and losing one in transit is
worse than refusing the document. The UBL JSON form carries only the four
namespaces it hoists to `_D` / `_A` / `_B` / `_E`, so a document that reaches
you as JSON has whatever others it once had already gone.

## Entry points

The root import re-exports everything. Subpaths are narrower:

| Import                    | Contains                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| `@weiliang79/ubl-builder` | everything                                                         |
| `.../documents`           | `Invoice`                                                          |
| `.../cac`                 | aggregate components — `Party`, `TaxTotal`, `InvoiceLine`, …       |
| `.../datatypes`           | `UdtAmount`, `UdtCode`, `UBLVersionID`, the CCT and XSD primitives |
| `.../ext`                 | `UBLExtension`, `UBLExtensions`                                    |
| `.../sig`                 | `UBLDocumentSignatures`, `SignatureInformation`                    |
| `.../profiles/myinvois`   | Malaysia — LHDN vocabulary and profile                             |
| `.../profiles/dian`       | Colombia — retained, unmaintained                                  |
| `.../core`                | the component base, serializers and node types                     |

## Schemas

The OASIS UBL 2.1 OS schemas are vendored under `schemas/` and are the source
of truth for every component's structure. They are development-only and are
not published.

```sh
npm run scaffold          # write a component file for a schema type that has none
npm run report:schema     # differences between the components and the schemas
npm run check:schema      # fail if any params map disagrees (runs in CI)
npm run check:types       # fail if a component disagrees with its params map, or is unexported
npm run check:classref    # fail if a classRef is not the class implementing that element's type
npm run validate:xsd      # validate the golden fixtures against the XSD
npm run check:c14n        # fail if our Canonical XML 1.1 disagrees with libxml2
```

Validation is structural only — element sequence, names, cardinality,
datatypes. Not EN 16931 business rules: MyInvois deviates from BR-CO-13 by
reporting line-level discounts in `AllowanceTotalAmount` while
`LineExtensionAmount` is already net of them, so business-rule validation
rejects conformant documents.

## Signing — MyInvois document version 1.1

Version 1.0 is accepted unsigned. Version 1.1 enables signature validation and
needs an XAdES-BES signature, which `withSigner` attaches:

```ts
import { myInvois } from '@weiliang79/ubl-builder/profiles/myinvois';

const signing = myInvois.withSigner({
  sign: (bytes) => myHsm.sign(bytes), // RSA-SHA256 over the bytes given
  certificate: { base64, issuerName, serialNumber },
});

signing.defaults(invoice);
// …build the invoice…
await signing.finalize(invoice); // bumps listVersionID to 1.1, then signs
```

The private key never enters this library — `sign` is a callback, so a file, a
smartcard, an HSM or a cloud KMS all work, and the package still runs in a
browser. `issuerName` is supplied rather than parsed because the order of the
relative names is not canonical and differs between CAs; LHDN wants RFC 4514
order, which is the reverse of OpenSSL's rendering.

Submit the compact rendering — `getXml()`, never `getXml(true)`. LHDN
recanonicalizes what it receives, and a standard canonicalizer counts
indentation between elements as content.

Three of the four values in the signature reproduce LHDN's own published signed
reference document exactly; see `test/profiles/lhdnSignedSample.spec.ts` for
what is proven and what is not. **No submission has yet been accepted**, so
treat 1.1 as unverified against the live service.

Signing needs a certificate from an
[MCMC-licensed CA](https://www.mcmc.gov.my/en/sectors/digital-signature/list-of-licensees)
— an organisational one, and self-signed certificates are rejected in the
sandbox as well as in production.

## Validation — MyInvois rules checked offline

`myInvois.finalize` checks the document against the MyInvois rules that are
decidable without contacting LHDN, and throws `MyInvoisValidationError` with
**every** issue it found:

```ts
import { myInvois, MyInvoisValidationError } from '@weiliang79/ubl-builder/profiles/myinvois';

myInvois.defaults(invoice);
// …build the invoice…
try {
  myInvois.finalize(invoice);
} catch (error) {
  if (error instanceof MyInvoisValidationError) {
    error.issues.forEach((issue) => console.error(issue.code, issue.path, issue.message));
  }
}
```

`validateInvoice(invoice)` returns the same issues without throwing, if you
would rather not use exceptions for control flow.

Two classes of rejection are covered, both of which otherwise cost a round trip
to LHDN:

- **A dropped attribute.** Scalar params accept a bare `string` as shorthand for
  the `Udt*` classes, and a bare string carries no attributes — so
  `taxAmount: '0.00'` emits an amount with no `currencyID`. That is schema-valid
  and rejected on submission. The same applies to `schemeID`, `listID`,
  `unitCode` and `listVersionID`.
- **An incoherent consolidated e-Invoice.** Using the General Public TIN as the
  buyer silently reclassifies the document, and the buyer's state code and every
  line's classification code must change with it.

The rule of admission is that a check must be decidable from the document alone
and must never reject a document LHDN accepts — a validator that blocks valid
invoices is worse than none. Anything needing LHDN's own state (whether a TIN
exists, whether it matches your credentials, whether a submission duplicates an
earlier one) is left to the API. Monetary totals are deliberately not checked;
see the BR-CO-13 note above.

To skip validation, do not call `finalize` — at version 1.0 it is the only thing
the hook does. When signing, validation runs before the signature is attached;
call `signInvoice` directly to bypass it.

## Not implemented

- **Profile constraints beyond the offline rules above.** Anything needing
  LHDN's own state — whether a TIN exists, whether it matches the credentials
  behind a submission, whether a referenced document exists — is left to the
  API.

The library never computes or validates monetary totals — see the BR-CO-13
note above for why.

## Upgrading

See [MIGRATION.md](./MIGRATION.md). 0.1.0 moves every import path.

## Credits

A fork of [pipesanta/ubl-builder](https://github.com/pipesanta/ubl-builder) by
Felipe Santa, with contributions from Lars Buur. The component model, the
params-map interpreter and the original UBL type coverage came from there.
MIT, as is this.
