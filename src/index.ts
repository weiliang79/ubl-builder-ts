/**
 * @weiliang79/ubl-builder — build OASIS UBL 2.1 documents.
 *
 * The root entry point re-exports everything, which is convenient and pulls in
 * the whole library. Subpath imports are narrower and are what a bundle-size
 * sensitive consumer should reach for:
 *
 *   import { Invoice }   from '@weiliang79/ubl-builder/documents';
 *   import { Party }     from '@weiliang79/ubl-builder/cac';
 *   import { UBLDocumentSignatures } from '@weiliang79/ubl-builder/sig';
 *   import { UdtAmount } from '@weiliang79/ubl-builder/datatypes';
 *   import { myInvois }  from '@weiliang79/ubl-builder/profiles/myinvois';
 *
 * Country-specific behaviour lives behind a profile; the core knows only
 * UBL 2.1. See `Profile` for the contract.
 */

export * from './cac';
export * from './datatypes';
export * from './documents';
export * from './ext';
export type { Profile } from './profiles/Profile';
export * from './sig';

export { AggregateComponent, resolveClassRef, toJsonObject, toUblJson, toXmlObject, toXmlString } from './core';
export type {
  IGenericKeyValue,
  NodeSource,
  ParamsMapValues,
  UblJsonNamespaces,
  XmlAttributes,
  XmlContent,
  XmlNode,
  XmlOptions,
} from './core';
