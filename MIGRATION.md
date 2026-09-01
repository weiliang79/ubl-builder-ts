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

The document model is unchanged and XML output is byte-for-byte identical to
0.1.1. What changes is the _types_: `AllowedParams` was transcribed by hand and
had drifted from the schema in 232 places, so the declarations now say what UBL
says. Most of that is a relaxation and needs no action. Four groups do.

## Four fields became required

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

## Two fields became single values

Both were typed as arrays against `maxOccurs="1"`, so passing an array
type-checked and then threw `array given and max is defined` at serialization.
They were unusable; now they work.

| Component        | Field             | Was          | Now        |
| ---------------- | ----------------- | ------------ | ---------- |
| `CreditNoteLine` | `originatorParty` | `Party[]`    | `Party`    |
| `Party`          | `language`        | `Language[]` | `Language` |

## Thirty-three fields became arrays

These are `maxOccurs="unbounded"` in UBL but were typed as single values, so
setting more than one needed a cast. Fifty-seven sibling fields already followed
the array convention; these were the outliers. Wrap the value:

```ts
// before
new InvoiceLine({ id: '1', lineExtensionAmount: '100.00', item, delivery });

// after
new InvoiceLine({ id: '1', lineExtensionAmount: '100.00', item, delivery: [delivery] });
```

The runtime always accepted both, so this is a type-level change only — no
output differs.

## One field was misspelled

`PostalAddress` declared `AdditionalStreetName` while its params map keyed on
`additionalStreetName`, so the only spelling TypeScript accepted threw
`attribute AdditionalStreetName is not allowed` from the constructor, and the
spelling that worked did not compile. `cbc:AdditionalStreetName` — address line
2, on every invoice with a PO box — was unreachable either way.

```ts
// before — compiled, threw at construction
new PostalAddress({ AdditionalStreetName: 'Po Box 351' });

// after
new PostalAddress({ additionalStreetName: 'Po Box 351' });
```

This survived because three of the 52 components write
`interface AllowedParams {` where the rest write `type AllowedParams = {`, and
every generator scan matched only the second form. `DocumentReference`,
`ItemPriceExtension` and `PostalAddress` were silently exempt from all of them.
The scans now accept both, and `check:types` fails on a component it cannot
read rather than skipping it — which is how this was found.

## `DocumentReference.issuerParty` takes a party, not a string

It was declared `issuerParty?: string` with no params-map entry behind it, so
the field compiled and then threw `attribute issuerParty is not allowed` from
the constructor. `cac:IssuerParty` now works.

```ts
new DespatchDocumentReference({ id: 'DN-1', issuerParty: new IssuerParty({ … }) });
```

## Not a breaking change

193 fields that were declared required are now optional, because UBL marks them
`minOccurs="0"`. `CreditNoteLine` went from demanding 23 fields to one.
Existing code that passes them keeps compiling.

Nineteen child elements UBL defines were missing entirely and are now present:
seventeen on `PostalAddress` — `buildingName`, `floor`, `room`, `postbox`,
`markCare`, `district` and the rest of `AddressType` — plus
`DocumentReference.issuerParty` and `ItemPriceExtension.taxTotals`. All are
optional.

Fourteen params-map entries the fork had commented out are now live, including
`CreditNoteLine.allowanceCharges`, `DeliveryTerms.allowanceCharge`,
`Signature.signatureMethod`, `Signature.signatoryParty`, the three
`SupplierParty` contacts, and all six self-referential children —
`Party.agentParty`, `InvoiceLine.subInvoiceLines` and the rest. All are
optional, so nothing that compiles today stops compiling.
