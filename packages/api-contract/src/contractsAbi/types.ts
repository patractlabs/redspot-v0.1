// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { BTreeMap, Enum, Option, Struct, U8aFixed, Vec } from '@polkadot/types/codec';
import { Bytes, Text, bool, u32, u64 } from '@polkadot/types/primitive';

/** @name InkArrayLayout */
export interface InkArrayLayout extends Struct {
  readonly offset: InkLayoutKey;
  readonly len: u32;
  readonly cellsPerElem: u64;
  readonly layout: InkStorageLayout;
}

/** @name InkCellLayout */
export interface InkCellLayout extends Struct {
  readonly key: InkLayoutKey;
  readonly ty: MtLookupTypeId;
}

/** @name InkConstructorSpec */
export interface InkConstructorSpec extends Struct {
  readonly name: Text;
  readonly selector: InkSelector;
  readonly args: Vec<InkMessageParamSpec>;
  readonly docs: Vec<Text>;
}

/** @name InkContractSpec */
export interface InkContractSpec extends Struct {
  readonly constructors: Vec<InkConstructorSpec>;
  readonly messages: Vec<InkMessageSpec>;
  readonly events: Vec<InkEventSpec>;
  readonly docs: Vec<Text>;
}

/** @name InkCryptoHasher */
export interface InkCryptoHasher extends Enum {
  readonly isBlake2X256: boolean;
  readonly isSha2X256: boolean;
  readonly isKeccak256: boolean;
}

/** @name InkDiscriminant */
export interface InkDiscriminant extends Struct {}

/** @name InkDisplayName */
export interface InkDisplayName extends Vec<Text> {}

/** @name InkEnumLayout */
export interface InkEnumLayout extends Struct {
  readonly dispatchKey: InkLayoutKey;
  readonly variants: BTreeMap<InkDiscriminant, InkStructLayout>;
}

/** @name InkEventParamSpec */
export interface InkEventParamSpec extends Struct {
  readonly name: Text;
  readonly indexed: bool;
  readonly type: InkTypeSpec;
  readonly docs: Vec<Text>;
}

/** @name InkEventSpec */
export interface InkEventSpec extends Struct {
  readonly name: Text;
  readonly args: Vec<InkEventParamSpec>;
  readonly docs: Vec<Text>;
}

/** @name InkFieldLayout */
export interface InkFieldLayout extends Struct {
  readonly name: Option<Text>;
  readonly layout: InkStorageLayout;
}

/** @name InkHashingStrategy */
export interface InkHashingStrategy extends Struct {
  readonly hasher: InkCryptoHasher;
  readonly prefix: Bytes;
  readonly postfix: Bytes;
}

/** @name InkHashLayout */
export interface InkHashLayout extends Struct {
  readonly offset: InkLayoutKey;
  readonly strategy: InkHashingStrategy;
  readonly layout: InkStorageLayout;
}

/** @name InkLayoutKey */
export interface InkLayoutKey extends U8aFixed {}

/** @name InkMessageParamSpec */
export interface InkMessageParamSpec extends Struct {
  readonly name: Text;
  readonly type: InkTypeSpec;
}

/** @name InkMessageSpec */
export interface InkMessageSpec extends Struct {
  readonly name: Text;
  readonly selector: InkSelector;
  readonly mutates: bool;
  readonly args: Vec<InkMessageParamSpec>;
  readonly returnType: InkReturnTypeSpec;
  readonly docs: Vec<Text>;
}

/** @name InkProject */
export interface InkProject extends Struct {
  readonly lookup: MtRegistry;
  readonly storage: InkStorageLayout;
  readonly spec: InkContractSpec;
}

/** @name InkReturnTypeSpec */
export interface InkReturnTypeSpec extends Option<InkTypeSpec> {}

/** @name InkSelector */
export interface InkSelector extends U8aFixed {}

/** @name InkStorageLayout */
export interface InkStorageLayout extends Enum {
  readonly isCell: boolean;
  readonly asCell: InkCellLayout;
  readonly isHash: boolean;
  readonly asHash: InkHashLayout;
  readonly isArray: boolean;
  readonly asArray: InkArrayLayout;
  readonly isStruct: boolean;
  readonly asStruct: InkStructLayout;
  readonly isEnum: boolean;
  readonly asEnum: InkEnumLayout;
}

/** @name InkStructLayout */
export interface InkStructLayout extends Struct {
  readonly fields: Vec<InkFieldLayout>;
}

/** @name InkTypeSpec */
export interface InkTypeSpec extends Struct {
  readonly id: MtLookupTypeId;
  readonly displayName: InkDisplayName;
}

/** @name MtField */
export interface MtField extends Struct {
  readonly name: Option<Text>;
  readonly type: MtLookupTypeId;
}

/** @name MtLookupTypeId */
export interface MtLookupTypeId extends u32 {}

/** @name MtRegistry */
export interface MtRegistry extends Vec<MtType> {}

/** @name MtType */
export interface MtType extends Struct {
  readonly path: Vec<Text>;
  readonly params: Vec<MtLookupTypeId>;
  readonly def: MtTypeDef;
}

/** @name MtTypeDef */
export interface MtTypeDef extends Enum {
  readonly isComposite: boolean;
  readonly asComposite: MtTypeDefComposite;
  readonly isVariant: boolean;
  readonly asVariant: MtTypeDefVariant;
  readonly isSequence: boolean;
  readonly asSequence: MtTypeDefSequence;
  readonly isArray: boolean;
  readonly asArray: MtTypeDefArray;
  readonly isTuple: boolean;
  readonly asTuple: MtTypeDefTuple;
  readonly isPrimitive: boolean;
  readonly asPrimitive: MtTypeDefPrimitive;
}

/** @name MtTypeDefArray */
export interface MtTypeDefArray extends Struct {
  readonly len: u32;
  readonly type: MtLookupTypeId;
}

/** @name MtTypeDefComposite */
export interface MtTypeDefComposite extends Struct {
  readonly fields: Vec<MtField>;
}

/** @name MtTypeDefPrimitive */
export interface MtTypeDefPrimitive extends Enum {
  readonly isBool: boolean;
  readonly isChar: boolean;
  readonly isStr: boolean;
  readonly isU8: boolean;
  readonly isU16: boolean;
  readonly isU32: boolean;
  readonly isU64: boolean;
  readonly isU128: boolean;
  readonly isI8: boolean;
  readonly isI16: boolean;
  readonly isI32: boolean;
  readonly isI64: boolean;
  readonly isI128: boolean;
}

/** @name MtTypeDefSequence */
export interface MtTypeDefSequence extends Struct {
  readonly type: MtLookupTypeId;
}

/** @name MtTypeDefTuple */
export interface MtTypeDefTuple extends Vec<MtLookupTypeId> {}

/** @name MtTypeDefVariant */
export interface MtTypeDefVariant extends Struct {
  readonly variants: Vec<MtVariant>;
}

/** @name MtVariant */
export interface MtVariant extends Struct {
  readonly name: Text;
  readonly fields: Vec<MtField>;
  readonly discriminant: Option<u64>;
}

export type PHANTOM_CONTRACTSABI = 'contractsAbi';
