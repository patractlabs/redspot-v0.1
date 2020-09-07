// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import sanitize from '@polkadot/types/create/sanitize';
import { InterfaceTypes } from '@polkadot/types/types';
import { assert, isUndefined } from '@polkadot/util';
import {
  InkProject,
  MtField,
  MtLookupTypeId,
  MtType,
  MtTypeDef,
  MtTypeDefArray,
  MtTypeDefPrimitive,
  MtTypeDefSequence,
  MtTypeDefTuple,
  MtTypeDefVariant,
} from './contractsAbi/types';
import { InkTypeDef } from './types';

// this maps through the the enum definition in types/interfaces/contractsAbi/defintions.ts
const PRIMITIVES: (keyof InterfaceTypes)[] = [
  'bool',
  'u8',
  'Text',
  'u8',
  'u16',
  'u32',
  'u64',
  'u128',
  'i8',
  'i16',
  'i32',
  'i64',
  'i128',
];

function sanitizeOrUndefined(type: string | null): string | undefined {
  return type ? sanitize(type, { allowNamespaces: false }) : undefined;
}

function resolveTypeFromId(project: InkProject, typeId: MtLookupTypeId): string {
  const type = getInkType(project, typeId);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return resolveType(project, type);
}

// convert a typeid into a VecFixed
function getTypeArray(project: InkProject, idArray: MtTypeDefArray): string {
  const type = resolveTypeFromId(project, idArray.type);

  return `[${type};${idArray.len}]`;
}

// convert a typeid into the custom
function resolveTypeFromPath(project: InkProject, type: MtType): string {
  const nameSegments = type.path.toArray();
  const params = type.params.length
    ? `<${type.params.map((type): string | null => resolveTypeFromId(project, type)).join(', ')}>`
    : '';
  const name = nameSegments.length ? `${type.path[nameSegments.length - 1]}` : '';

  return `${name}${params}`;
}

// Fields must either be *all* named (e.g. a struct) or *all* unnamed (e.g a tuple)
function buildTypeDefFields(project: InkProject, typeFields: MtField[]): string {
  let allNamed = true;
  let allUnnamed = true;
  for (const field of typeFields) {
    allNamed = allNamed && field.name.isSome;
    allUnnamed = allUnnamed && field.name.isNone;
  }

  if (allNamed) {
    const fields = typeFields.map((field): string => {
      const type = resolveTypeFromId(project, field.type);

      const name = field.name.unwrap().toString();
      return `"${name}": ${JSON.stringify(type)}`;
    });

    return fields.length ? `({${fields.join(',')}})` : 'Null';
  }

  if (allUnnamed) {
    const fields = typeFields.map((field): string => resolveTypeFromId(project, field.type));

    return fields.length ? `${fields.join(', ')}` : 'Null';
  }

  throw new Error('buildTypeDefFields:: Fields must either be *all* named or *all* unnamed');
}

function buildTypeDefVariant(project: InkProject, typeVariant: MtTypeDefVariant): string {
  let allUnitVariants = true;
  for (const variant of typeVariant.variants) {
    allUnitVariants = allUnitVariants && variant.fields.length === 0;
  }

  if (allUnitVariants) {
    // FIXME We are currently ignoring the discriminant
    const variants = typeVariant.variants.map(({ name }): string => name.toString());

    return variants.length ? `{"_enum":[${variants.join(', ')}]}` : 'Null';
  }

  const variants = typeVariant.variants.map(({ name, fields, discriminant }): string => {
    assert(discriminant.isNone, "Only enums with all 'unit' variants (i.e. C-like enums) can have discriminants");

    const variantName = name.toString();
    const variantFields = buildTypeDefFields(project, fields);

    return `"${variantName}": "${variantFields}"`;
  });

  return variants.length ? `{"_enum":{${variants.join(', ')}}}` : 'Null';
}

// convert a type definition into a primitive
function getTypePrimitive(_project: InkProject, idPrim: MtTypeDefPrimitive): keyof InterfaceTypes {
  const primitive = PRIMITIVES[idPrim.index];

  assert(!isUndefined(primitive), `getTypePrimitive:: Unable to convert ${idPrim} to primitive`);

  return primitive;
}

// convert a type definition into the underlying Vec
function getTypeSlice(project: InkProject, idSlice: MtTypeDefSequence): string {
  const type = resolveTypeFromId(project, idSlice.type);

  return `Vec<${type}>`;
}

function getTypeTuple(project: InkProject, typeTuple: MtTypeDefTuple): string {
  const types = typeTuple.map((type): string | null => resolveTypeFromId(project, type));

  return types.length ? `(${types.join(', ')})` : 'Null';
}

function resolveType(project: InkProject, type: MtType): string {
  if (type.def.isComposite) {
    return resolveTypeFromPath(project, type);
  } else if (type.def.isVariant) {
    return resolveTypeFromPath(project, type);
  } else if (type.def.isArray) {
    return getTypeArray(project, type.def.asArray);
  } else if (type.def.isPrimitive) {
    return getTypePrimitive(project, type.def.asPrimitive);
  } else if (type.def.isSequence) {
    return getTypeSlice(project, type.def.asSequence);
  } else if (type.def.isTuple) {
    return getTypeTuple(project, type.def.asTuple);
  }

  throw new Error(`convertType:: Unable to create type from ${type}`);
}

// builds the type definition for any user defined complex type e.g structs/enums
function buildTypeDef(project: InkProject, type: MtTypeDef): string | null {
  if (type.isComposite) {
    return buildTypeDefFields(project, type.asComposite.fields);
  } else if (type.isVariant) {
    return buildTypeDefVariant(project, type.asVariant);
  } else {
    return null;
  }
}

function convertType(project: InkProject, type: MtType, index: number): InkTypeDef {
  const name = sanitize(resolveType(project, type), { allowNamespaces: false });
  const _typeDef = buildTypeDef(project, type.def)
  const typeDef = sanitizeOrUndefined(_typeDef);
  return {
    id: index,
    name,
    typeDef,
  };
}

function convertTypes(project: InkProject, types: MtType[]): InkTypeDef[] {
  return types.map((type, index): InkTypeDef => convertType(project, type, index + 1));
}

export function getProjectTypes(project: InkProject): InkTypeDef[] {
  return convertTypes(project, project.lookup);
}

export function getProjectRegistryTypes(project: InkProject): Record<string, string> {
  const typeDefs = getProjectTypes(project);
  return typeDefs.reduce((result, curr) => {
    if (curr.typeDef) {
      result[curr.name] = curr.typeDef;
    }
    return result;
  }, {} as Record<string, string>);
}

// convert the offset into project-specific, index-1
export function getRegistryOffset(id: MtLookupTypeId): number {
  return id.toNumber() - 1;
}

// extract a single ink type defintion from the project
export function getInkType(project: InkProject, id: MtLookupTypeId): MtType {
  const offset = getRegistryOffset(id);
  const type = project.lookup[offset];

  assert(!isUndefined(type), `getInkType:: Unable to find ${id.toNumber()} in type values`);

  return type;
}

// extract and array of ink type defs from the project
export function getInkTypes(project: InkProject, ids: MtLookupTypeId[]): MtType[] {
  return ids.map((id): MtType => getInkType(project, id));
}
