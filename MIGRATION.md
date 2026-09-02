# Migrating to 0.1.0

0.1.0 restructures the package. The document model is unchanged — XML output
is byte-for-byte identical, verified against a fixture built from a production
invoice LHDN accepted — but every import path moves, and a few signatures
change.

## Import paths

`dist/` is no longer reachable. The package now declares subpath exports, so
imports name what they want rather than where it happens to be built.

| Before                                                                                 | After                               |
| -------------------------------------------------------------------------------------- | ----------------------------------- |
| `@weiliang79/ubl-builder/dist/ubl21/CommonAggregateComponents`                         | `@weiliang79/ubl-builder/cac`       |
| `@weiliang79/ubl-builder/dist/ubl21/CommonAggregateComponents/CommodityClassification` | `@weiliang79/ubl-builder/cac`       |
| `@weiliang79/ubl-builder/dist/ubl21/CommonAggregateComponents/ItemPriceExtension`      | `@weiliang79/ubl-builder/cac`       |
| `@weiliang79/ubl-builder/dist/ubl21/types/UnqualifiedDataTypes`                        | `@weiliang79/ubl-builder/datatypes` |
| `@weiliang79/ubl-builder/dist/ubl21/schemaDocuments`                                   | `@weiliang79/ubl-builder/documents` |
| `@weiliang79/ubl-builder/dist/ubl21/extensionComponents`                               | `@weiliang79/ubl-builder/ext`       |

The root import still works and now re-exports everything — 136 names rather
than 6, so components no longer need reaching for through `dist/`.

```ts
import { Invoice, Party, TaxScheme, UdtAmount } from '@weiliang79/ubl-builder';
```

## Signature changes

**`new Invoice(id)`** — the second `options` argument is gone. It carried DIAN
settings (`issuer`, `software`, `enviroment`) that had no business in a generic
document, and nothing read them. The `id` argument now works: it previously
was accepted and ignored, which is why the README's own example emitted an
empty document.

**`removeProperty(key)`** — took `(key, value)` and set the property instead of
removing it.

**`getHash()` is async** on the SHA classes in `profiles/dian`. They moved from
Node's `crypto` to Web Crypto so the package bundles for a browser, and Web
Crypto is promise-based. Nothing exported these before.

**`InvoiceOptions` is removed.** If you were passing DIAN configuration, that
belongs to a profile now — see `profiles/dian/CUFE.md`.

## Behaviour that changed on purpose

**Element names corrected in five components.** `Delivery.shipment`,
`DocumentReference.documentDescription`, `DocumentReference.validityPeriod`,
`ExternalReference.formatCode` and `TaxTotal.taxIncludedIndicator` emitted
names that exist in no UBL schema — wrong prefix, wrong case, or a stray
trailing space. If you relied on the malformed output, it is now correct.

**Cardinality corrected in 33 places** against the OASIS schemas. Some fields
that rejected arrays now accept them, and vice versa. `npm run check:schema`
keeps them honest.

**Five previously-dead entries now work.** Six `classRef` references were
broken by circular imports and threw `classRef is required`; five are fixed,
and the sixth is annotated as needing a component type that does not exist yet.

## New

- `Invoice.getJson()` renders OASIS UBL JSON v2.0, the format MyInvois accepts
  alongside XML.
- `profiles/myinvois` carries the LHDN vocabulary — tax type codes, document
  type codes, identification schemes, the `OTH` tax scheme.
- `getAsXml()` works on any component. It previously threw for anything with
  more than one child, and emitted unwrapped children for the rest.

# Migrating to 0.2.0

Three things arrive: an invoice can be read back from XML or JSON, eight of its
children can be set for the first time, and seven components can be imported at
all. Everything else is the type declarations catching up with the schema —
`AllowedParams` was transcribed by hand and had drifted in 256 places.

Most of that drift is a relaxation and needs no action. The sections under
**What breaks** do; the rest are recorded so you can tell whether a bug you
worked around is gone.

Documents built through `Invoice` serialise exactly as they did in 0.1.1: the
golden fixture is byte-for-byte unchanged at 4542 bytes.

## What's new

### Reading a document back

`Invoice.fromXml(xml)` and `Invoice.fromJson(document)` are the inverses of
`getXml()` and `getJson()`.

```ts
const invoice = Invoice.fromXml(receivedXml);
invoice.setDueDate('2026-08-01');
invoice.getXml(false, true); // byte-identical to what arrived, plus the change
```

Both rebuild the document from the same tables that write one, so what comes
out renders as what went in: the golden XML fixture round-trips byte for byte,
and the JSON fixture renders to the same XML.

An element that has no place in the document, or one appearing more often than
UBL allows, throws rather than being dropped: losing a value in transit is
worse than refusing the document.

One difference is not preserved: an empty element written `<x></x>` comes back
as `<x/>`. That is the serializer, not the reader — every empty element this
library writes is self-closing, however the document was built. The XML is
equivalent but the bytes are not, so a `documentHash` computed over a
re-serialised third-party invoice may differ from the sender's. Hash the bytes
you received.

`ext:ExtensionContent` is the exception, and deliberately. It is `xsd:any` in
the schema — arbitrary XML, and where MyInvois 1.1 puts the XAdES signature —
so there is nothing to build a component from. The subtree is carried through
as the nodes it was read as, which is what lets a signed invoice render back
byte for byte.

The UBL JSON form carries only the four namespaces it hoists to `_D` / `_A` /
`_B` / `_E`, so a document that reaches you as JSON has any others it once had
already gone. Those four are restored as root attributes.

### Eight invoice children that could not be set

Their setters existed and threw `not implemented`. `cac:PaymentTerms` and
`cac:PayeeParty` are ordinary on a commercial invoice, and
`cac:WithholdingTaxTotal` is what MyInvois uses for withholding.

| Method                              | Element                              |
| ----------------------------------- | ------------------------------------ |
| `setPayeeParty`                     | `cac:PayeeParty`                     |
| `setBuyerCustomerParty`             | `cac:BuyerCustomerParty`             |
| `setSellerSupplierParty`            | `cac:SellerSupplierParty`            |
| `addPaymentTerm`                    | `cac:PaymentTerms`                   |
| `setTaxExchangeRate`                | `cac:TaxExchangeRate`                |
| `setPricingExchangeRate`            | `cac:PricingExchangeRate`            |
| `setPaymentAlternativeExchangeRate` | `cac:PaymentAlternativeExchangeRate` |
| `addWithholdingTaxTotal`            | `cac:WithholdingTaxTotal`            |

```ts
invoice
  .addPaymentTerm(new PaymentTerms({ notes: ['net 30'] }))
  .setPayeeParty(new PayeeParty({ partyLegalEntities: [legalEntity] }));
```

Five element aliases came with them: `PayeeParty`, `BuyerCustomerParty`,
`SellerSupplierParty`, `TaxExchangeRate` and `PaymentAlternativeExchangeRate`.

### Every UBL 2.1 aggregate component

The package had 51 of the 109 complex types UBL 2.1 defines, which left 31
child elements with no class to put in them — `cac:Person` on a party,
`cac:CardAccount` on payment means, `cac:Dimension` on an item,
`cac:Consignment` and the rest of the transport tree on a shipment.

All 109 are present now, written from the schema by `npm run scaffold` and held
to it by the same three checks as the rest. `npm run report:schema` reports no
missing elements for the first time.

Nothing that exists changes: every new component is a new class, and every new
child is optional.

### Seven components became reachable

`Attachment`, `CommodityClassification`, `ExternalReference`,
`FinancialInstitution`, `FinancialInstitutionBranch`, `ItemPriceExtension` and
`SellersItemIdentification` were missing from the `cac` barrel. Since
`./cac/<file>` is not an exported subpath, nothing outside the package could
name them at all — `DocumentReference.attachment` could not be set because
there was no way to build an `Attachment`.

```ts
import { Attachment, ExternalReference } from '@weiliang79/ubl-builder/cac';
```

`IssuerPartyParams` was on its module and missing from the barrel; it is
exported now.

## What breaks

### Four fields became required

Each is `minOccurs="1"` in UBL, and omitting it produces XML the XSD rejects —
so this turns a rejected submission into a compile error.

| Component        | Field           | Element             |
| ---------------- | --------------- | ------------------- |
| `AddressLine`    | `line`          | `cbc:Line`          |
| `DeliveryUnit`   | `batchQuantity` | `cbc:BatchQuantity` |
| `OrderReference` | `id`            | `cbc:ID`            |
| `TaxCategory`    | `taxScheme`     | `cac:TaxScheme`     |

```ts
// before — compiled, emitted invalid XML
new TaxCategory({ id: '06' });

// after
new TaxCategory({ id: '06', taxScheme: new TaxScheme({ id: 'OTH' }) });
```

### Thirty-three fields became arrays

These are `maxOccurs="unbounded"` in UBL but were typed as single values, so
setting more than one needed a cast. Most fields UBL marks unbounded were
already arrays; these were the outliers. Wrap the value:

```ts
// before
new InvoiceLine({ id: '1', lineExtensionAmount: '100.00', item, delivery });

// after
new InvoiceLine({ id: '1', lineExtensionAmount: '100.00', item, delivery: [delivery] });
```

The runtime always accepted both, so this is a type-level change only — no
output differs.

### Two fields became single values

Both were typed as arrays against `maxOccurs="1"`, so passing an array
type-checked and then threw `array given and max is defined` at serialization.
They were unusable; now they work.

| Component        | Field             | Was          | Now        |
| ---------------- | ----------------- | ------------ | ---------- |
| `CreditNoteLine` | `originatorParty` | `Party[]`    | `Party`    |
| `Party`          | `language`        | `Language[]` | `Language` |

### Eight fields narrowed to the datatype UBL names

A params-map entry's `classRef` decides what a raw value is wrapped in, and
nothing compared it to the schema until now. `npm run check:classref` does.
These eight named a datatype UBL does not use there, so each accepts one fewer
wrapper than it did.

| Component            | Field                       | Was             | Now          |
| -------------------- | --------------------------- | --------------- | ------------ |
| `AllowanceCharge`    | `multiplierFactorNumeric`   | `UdtAmount`     | `UdtNumeric` |
| `OrderLineReference` | `lineStatusCode`            | `UdtIdentifier` | `UdtCode`    |
| `PaymentTerms`       | `settlementDiscountPercent` | `UdtCode`       | `UdtPercent` |
| `CreditNoteLine`     | `accountingCost`            | `UdtAmount`     | `UdtText`    |
| `Address`            | `streetName`                | `UdtText`       | `UdtName`    |
| `Address`            | `additionalStreetName`      | `UdtText`       | `UdtName`    |
| `Address`            | `cityName`                  | `UdtText`       | `UdtName`    |
| `Address`            | `countrySubentityCode`      | `UdtText`       | `UdtCode`    |

The wrong wrapper kept the text and carried the wrong attribute set, so typed
code with no casts in it could emit XML the XSD rejects:

```
element MultiplierFactorNumeric: Schemas validity error :
  attribute 'currencyID': The attribute 'currencyID' is not allowed.
```

Passing a plain string is unaffected — that is how most values arrive, and it
was always wrapped correctly on the way out. Only code constructing the wrapper
itself needs to change.

### One `cac:AddressType`, not two

`Address` and `PostalAddress` were separate classes implementing the same UBL
type, and had already drifted apart on four `classRef`s before this. Two files
implementing one type is now refused by `check:classref`.

`PostalAddress` is an alias of `Address`, alongside `DeliveryAddress`,
`DespatchAddress`, `JurisdictionRegionAddress`, `RegistrationAddress`,
`OriginAddress` and `ReturnAddress` — one class, one alias per element it
serves, as `Party` and `TaxTotal` already work. Every name still imports:
`PostalAddress`, `PostalAddressTypeParams`, `AddressParams`.

**`addressLine` is now `addressLines`.** The two implementations named the same
child differently and the surviving one is plural, matching the convention for
an element UBL marks unbounded.

```ts
// before
new PostalAddress({ addressLine: [new AddressLine({ line: '1 Jalan Contoh' })] });

// after
new PostalAddress({ addressLines: [new AddressLine({ line: '1 Jalan Contoh' })] });
```

**`getAsXml()` with no element name now returns `<cac:Address>`.** One class
serves twelve elements, so there is no single right default; in a document the
parent decides the name and nothing changes. Pass the name explicitly if you
serialise an address on its own:

```ts
address.getAsXml(false, true, 'cac:PostalAddress');
```

`Address` previously defaulted to `cac:AddressType`, a type name for which no
element exists — that output failed XSD validation.

### Two exported names were wrong

`AddressParams` named the `Address` class rather than its params type, so
`const a: AddressParams = { streetName: '…' }` did not compile and `Address`
had no usable params type at all. It names the type now. Code using it as a
value — `new AddressParams(…)` — should use `Address`.

`ExternalReference`'s params type was exported as `ExternalReferenceAttributes`
where every other component uses `…Params`. It is `ExternalReferenceParams`
now; nothing could have imported the old name, since the component was not in
the barrel.

## Fixed, and needing no action

These were unusable or silently wrong. If you worked around one, the workaround
can go.

### Values that were being discarded

`Delivery.deliveryTerms` named `UdtDate` for `cac:DeliveryTerms`, an aggregate.
The component was rebuilt as a date and serialised as an empty element:

```xml
<cac:Delivery><cac:DeliveryTerms></cac:DeliveryTerms></cac:Delivery>
```

`UBLExtensions` assigned `this.attributes.UBLExtensions = []` immediately after
`super()`, so anything passed to the constructor was discarded the line after
it was stored, and `new UBLExtensions({ UBLExtensions: [extension] })`
serialised as an empty `<ext:UBLExtensions/>`. It defaults rather than resets
now; `addUBLExtension` and `getDianUblExtension` are unaffected.

### Fields whose only accepted value threw

`PaymentTerms` declared `constructor(content: string)`, so the only call its
signature allowed threw `attribute 0 is not allowed` and every working call
needed a cast. It takes `PaymentTermsTypeParams` now, like every other
component.

`DocumentReference.issuerParty` was declared `string` with no params-map entry
behind it. `DocumentReference.attachment` and `.validityPeriod` were declared
`string` against entries wrapping in `Attachment` and `ValidityPeriod`. All
three compiled and then threw; all three take their component now.

`AdditionalStreetName` was declared where the params map keyed on
`additionalStreetName`, so the only spelling TypeScript accepted threw and the
one that worked did not compile. `cbc:AdditionalStreetName` — address line 2,
on every invoice with a PO box — was unreachable either way. It is
`additionalStreetName`.

This last one survived because a few components write
`interface AllowedParams {` where the rest write `type AllowedParams = {`, and
every generator scan matched only the second form. `DocumentReference`,
`ItemPriceExtension` and the address component were silently exempt from all of
them — two of the three still use the interface form, and the scans accept both
now. `check:types` fails on a component it cannot read rather than skipping
it.

### Declarations that refused values the entry accepts

Eleven fields named no class where the entry wraps one, so the declaration
refused a wrapper the entry would have accepted. Ten are on
`DocumentReference` — `id`, `issueDate`, `versionID` and the rest declared
`string`, `xPath` declared `string[]` — which left no way to set a `schemeID`
on an `id` or a `languageID` on a description. The eleventh is
`PartyTaxScheme.exemptionReason`, declared `string[]` where the entry wraps in
`UdtText`.

Each of these widens what a field accepts, so nothing that compiles today stops
compiling. `check:classref` holds a `classRef` to the schema; `check:types` now
holds the declaration to the `classRef`, which is what found them. The
corrections that go the other way are under **What breaks** above.

## Not a breaking change

193 fields that were declared required are now optional, because UBL marks them
`minOccurs="0"`. `CreditNoteLine` went from demanding 23 fields to one. Existing
code that passes them keeps compiling.

Fifteen children the fork had left commented out or never transcribed are now
settable, all optional:

`CreditNoteLine.allowanceCharges`, `DeliveryTerms.allowanceCharge`,
`ItemPriceExtension.taxTotals`, `Party.financialAccount`,
`Signature.signatureMethod`, `Signature.signatoryParty`, the three
`SupplierParty` contacts, and all six self-referential children —
`Party.agentParty`, `InvoiceLine.subInvoiceLines`,
`CreditNoteLine.subCreditNoteLines`, `DebitNoteLine.subDebitNoteLines`,
`Location.subsidiaryLocations` and `PriceList.previousPriceList`.

If you used `PostalAddress` rather than `Address`, seventeen more children of
`AddressType` become available: `buildingName`, `buildingNumber`, `blockName`,
`floor`, `room`, `postbox`, `inhouseMail`, `department`, `markAttention`,
`markCare`, `plotIdentification`, `citySubdivisionName`, `region`, `district`,
`timezoneOffset`, `addressTypeCode` and `addressFormatCode`. `Address` already
had them; the two classes are now the same one.

# Migrating to 0.3.0

Additive. Nothing was removed from the public API and no import path moved, so
an application on 0.2.0 compiles unchanged.

## What's new

### XAdES signing for MyInvois document version 1.1

`myInvois.withSigner({ sign, certificate })` returns a configured profile whose
`finalize()` bumps `listVersionID` to 1.1 and attaches the signature. The
`Profile` interface is unchanged — `finalize` still takes only a document —
because signing needs a key and a certificate, which a plain profile has
nowhere to put.

The private key never enters this library: `sign` is a callback, so a file, a
smartcard, an HSM or a cloud KMS all work. `certificate.issuerName` is supplied
rather than parsed, because the order of the relative names is not canonical
and differs between CAs.

Version 1.0 continues to work exactly as before, and remains the default.

### Canonical XML 1.1

`toXmlString(node, { canonical: true })` emits the form a signature is computed
over. Ordinary output is untouched — the same document still serialises to the
same bytes. Verified against libxml2 by the new `check:c14n` gate, and against
LHDN's own published signed document.

### `sig:` and `sac:` components

`@weiliang79/ubl-builder/sig` adds `UBLDocumentSignatures`,
`SignatureInformation` and `SignatureExtensionContent`. OASIS ships these
schemas as part of UBL 2.1; they had simply never been modelled here.

## What changed in the output

### Empty attributes are no longer dropped

One behaviour change, and the only reason this is 0.3.0 rather than 0.2.1.

`toXmlObject` and `toJsonObject` used to filter attributes on truthiness, so an
attribute set to the empty string vanished — as did a legitimate `0` or
`false`. Both writers now drop only `undefined` and `null`.

This matters because XMLDSig's first `ds:Reference` carries `URI=""`, which
means "this whole document" and is _not_ the same claim as omitting the
attribute. The old behaviour silently swallowed it.

**Who is affected:** only code that deliberately sets an attribute to `''`,
`0` or `false`. Such an attribute now appears in the output, which changes the
document's bytes and therefore its `documentHash`. No fixture in this repo
changed, and the golden MyInvois invoice still serialises to the same 4542
bytes.

## Fixed, and needing no action

### A component that described an element UBL does not have

`src/ext/SignatureExtensions.ts` declared `cac:SignatureExtensions`, which
appears nowhere in the UBL 2.1 schemas, with an empty params map. It was
exported from no barrel and imported by nothing. Removed, and replaced by the
real thing in `sig/SignatureExtensionContent`.

### Signing digests moved out of the Colombian profile

`profiles/dian/shas.ts` became `signing/digest.ts`. It was always a generic
Web Crypto helper rather than anything Colombian, and core signing importing
from a country profile would have been backwards. It was not exported from any
barrel, so no import path changes.
