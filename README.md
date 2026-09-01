# ubl-builder

[![license: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)

Build XML documents to the OASIS **UBL 2.1** (Universal Business Language)
standard, with optional country profiles layered on top.

- **UBL 2.1 documents** — components are held to the OASIS schemas by a CI
  check that fails on any disagreement in element name, order or cardinality
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
| `.../profiles/myinvois`   | Malaysia — LHDN vocabulary and profile                             |
| `.../profiles/dian`       | Colombia — retained, unmaintained                                  |
| `.../core`                | the component base, serializers and node types                     |

## Schemas

The OASIS UBL 2.1 OS schemas are vendored under `schemas/` and are the source
of truth for every component's structure. They are development-only and are
not published.

```sh
npm run report:schema     # differences between the components and the schemas
npm run check:schema      # fail if any params map disagrees (runs in CI)
npm run check:types       # fail if a component disagrees with its params map, or is unexported
npm run check:classref    # fail if a classRef is not the class implementing that element's type
npm run validate:xsd      # validate the golden fixtures against the XSD
```

Validation is structural only — element sequence, names, cardinality,
datatypes. Not EN 16931 business rules: MyInvois deviates from BR-CO-13 by
reporting line-level discounts in `AllowanceTotalAmount` while
`LineExtensionAmount` is already net of them, so business-rule validation
rejects conformant documents.

## Not implemented

- **XAdES signing.** MyInvois document version 1.1 enables signature
  validation; this library ships the `finalize()` seam and no-ops for 1.0.
  Signing is planned, and becomes urgent when LHDN announces a deprecation date
  for version 1.0 — none has been announced. Version 1.0 needs no signature,
  and its `documentHash` is a digest of opaque bytes that belongs in your API
  client.
- **Profile constraints.** MyInvois requires fields UBL marks optional; the
  library does not yet enforce that, and LHDN rejects them on submission.
- **31 UBL child elements** are not yet reachable, each needing one of 26
  component types that do not exist here yet. Run `npm run generate:complete`
  for the current list, or `npm run report:schema` — the two agree. Everything
  absent is optional in UBL.

The library never computes or validates monetary totals — see the BR-CO-13
note above for why.

## Upgrading

See [MIGRATION.md](./MIGRATION.md). 0.1.0 moves every import path.

## Credits

A fork of [pipesanta/ubl-builder](https://github.com/pipesanta/ubl-builder) by
Felipe Santa, with contributions from Lars Buur. The component model, the
params-map interpreter and the original UBL type coverage came from there.
MIT, as is this.
