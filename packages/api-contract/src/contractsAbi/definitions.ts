// Copyright 2017-2019 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const layout = {
  InkCryptoHasher: {
    _enum: ['Blake2x256', 'Sha2x256', 'Keccak256']
  },
  InkHashingStrategy: {
    hasher: 'InkCryptoHasher',
    prefix: 'Vec<u8>',
    postfix: 'Vec<u8>'
  },
  InkDiscriminant: {}, // todo usize
  InkLayoutKey: '[u8; 32]',
  InkFieldLayout: {
    name: 'Option<Text>',
    layout: 'InkStorageLayout'
  },
  InkCellLayout: {
    key: 'InkLayoutKey',
    ty: 'MtLookupTypeId'
  },
  InkHashLayout: {
    offset: 'InkLayoutKey',
    strategy: 'InkHashingStrategy',
    layout: 'InkStorageLayout'
  },
  InkArrayLayout: {
    offset: 'InkLayoutKey',
    len: 'u32',
    cellsPerElem: 'u64',
    layout: 'InkStorageLayout'
  },
  InkStructLayout: {
    fields: 'Vec<InkFieldLayout>'
  },
  InkEnumLayout: {
    dispatchKey: 'InkLayoutKey',
    variants: 'BTreeMap<InkDiscriminant,InkStructLayout>'
  },
  InkStorageLayout: {
    _enum: {
      Cell: 'InkCellLayout',
      Hash: 'InkHashLayout',
      Array: 'InkArrayLayout',
      Struct: 'InkStructLayout',
      Enum: 'InkEnumLayout'
    }
  }
};

const spec = {
  InkDisplayName: 'Vec<Text>',
  InkReturnTypeSpec: 'Option<InkTypeSpec>',
  InkConstructorSpec: {
    name: 'Text',
    selector: 'InkSelector',
    args: 'Vec<InkMessageParamSpec>',
    docs: 'Vec<Text>'
  },
  InkContractSpec: {
    constructors: 'Vec<InkConstructorSpec>',
    messages: 'Vec<InkMessageSpec>',
    events: 'Vec<InkEventSpec>',
    docs: 'Vec<Text>'
  },
  InkEventParamSpec: {
    name: 'Text',
    indexed: 'bool',
    type: 'InkTypeSpec',
    docs: 'Vec<Text>'
  },
  InkEventSpec: {
    name: 'Text',
    args: 'Vec<InkEventParamSpec>',
    docs: 'Vec<Text>'
  },
  InkMessageParamSpec: {
    name: 'Text',
    type: 'InkTypeSpec'
  },
  InkMessageSpec: {
    name: 'Text',
    selector: 'InkSelector',
    mutates: 'bool',
    args: 'Vec<InkMessageParamSpec>',
    returnType: 'InkReturnTypeSpec',
    docs: 'Vec<Text>'
  },
  InkSelector: '[u8; 4]',
  InkTypeSpec: {
    id: 'MtLookupTypeId',
    displayName: 'InkDisplayName'
  }
};

const registry = {
  MtLookupTypeId: 'u32',
  MtField: {
    name: 'Option<Text>',
    type: 'MtLookupTypeId'
  },
  MtRegistry: 'Vec<MtType>',
  MtType: {
    path: 'Vec<Text>',
    params: 'Vec<MtLookupTypeId>',
    def: 'MtTypeDef'
  },
  MtTypeDef: {
    _enum: {
      Composite: 'MtTypeDefComposite',
      Variant: 'MtTypeDefVariant',
      Sequence: 'MtTypeDefSequence',
      Array: 'MtTypeDefArray',
      Tuple: 'MtTypeDefTuple',
      Primitive: 'MtTypeDefPrimitive'
    }
  },
  MtTypeDefComposite: {
    fields: 'Vec<MtField>'
  },
  MtTypeDefVariant: {
    variants: 'Vec<MtVariant>'
  },
  MtTypeDefArray: {
    len: 'u32',
    type: 'MtLookupTypeId'
  },
  MtTypeDefPrimitive: {
    // this enum definition is mapped in api-contracts/inkTypes.ts
    _enum: ['Bool', 'Char', 'Str', 'U8', 'U16', 'U32', 'U64', 'U128', 'I8', 'I16', 'I32', 'I64', 'I128']
  },
  MtTypeDefSequence: {
    type: 'MtLookupTypeId'
  },
  MtTypeDefTuple: 'Vec<MtLookupTypeId>',
  MtVariant: {
    name: 'Text',
    fields: 'Vec<MtField>',
    discriminant: 'Option<u64>'
  }
};

export default {
  types: {
    ...layout,
    ...registry,
    ...spec,
    InkProject: {
      _alias: {
        lookup: 'types'
      },
      lookup: 'MtRegistry',
      storage: 'InkStorageLayout',
      spec: 'InkContractSpec'
    }
  }
};
