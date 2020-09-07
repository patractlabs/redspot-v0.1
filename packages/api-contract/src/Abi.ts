// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Compact, createClass } from '@polkadot/types';
import { CodecArg, Constructor, Codec } from '@polkadot/types/types';
import { Struct, Enum } from '@polkadot/types/codec';
import { assert, stringCamelCase } from '@polkadot/util';
import { InkConstructorSpec, InkMessageSpec, InkProject, MtLookupTypeId } from './contractsAbi';
import InkRegistry from './InkRegistry';
import { getProjectRegistryTypes, getProjectTypes } from './inkTypes';
import { AbiConstructors, AbiMessages, ContractABIFn, ContractABIFnArg, InkTypeDef } from './types';

export default class ContractAbi {
  public readonly abi: InkProject;
  public readonly inkRegistry: InkRegistry;
  public readonly typeDefs: InkTypeDef[];

  public readonly constructors: AbiConstructors;

  public readonly messages: AbiMessages;

  constructor(project: Record<string, any>) {
    this.inkRegistry = new InkRegistry();
    this.abi = this.inkRegistry.createType('InkProject' as any, project) as InkProject;
    this.typeDefs = getProjectTypes(this.abi);

    [this.constructors, this.messages] = this.decodeAbi(this.abi);
    this.registerTypes();
  }

  public createType(type: any, data: any) {
    return this.inkRegistry.createType(type, data);
  }

  public createEventData(data: any) {
    return this.inkRegistry.createType('ContractExecution' as any, data);
  }

  private decodeAbi(abi: InkProject): [ContractABIFn[], AbiMessages] {
    const constructors = abi.spec.constructors.map(
      (constructor, index): ContractABIFn => {
        return this.createMessage(`constructor ${index}`, constructor);
      },
    );

    const messages: AbiMessages = abi.spec.messages.reduce((result: AbiMessages, message): AbiMessages => {
      const name = stringCamelCase(message.name.toString());

      return {
        ...result,
        [name]: this.createMessage(`messages.${name}`, message),
      };
    }, {});

    return [constructors, messages];
  }

  public registerTypes() {
    this.inkRegistry.register(getProjectRegistryTypes(this.abi));

    const eventsEumn: Record<string, Constructor<any>> = {};

    for (const [_, eventSpec] of this.abi.spec.events.entries()) {
      const struct: Record<string, Constructor<Codec> | undefined> = {};
      for (const [_, arg] of eventSpec.args.entries()) {
        struct[arg.name.toString()] = this.inkRegistry.createClass(this.getTypeDefAt(arg.type.id).toString() as any);
      }

      eventsEumn[eventSpec.name.toString()] = Struct.with(struct as any);
    }

    this.inkRegistry.register({
      ContractExecution: Enum.with(eventsEumn),
    });
  }

  public getTypeDefAt(findId: MtLookupTypeId): string {
    const findTypeDef = this.typeDefs.find(({ id }) => id === findId.toNumber());
    assert(findTypeDef, `Invalid type at index ${findId.toString()}`);
    return findTypeDef.typeDef || findTypeDef.name;
  }

  public createMessage(name: string, message: InkConstructorSpec | InkMessageSpec): ContractABIFn {
    const args = message.args.map(
      ({ name, type }): ContractABIFnArg => {
        return {
          name: stringCamelCase(name.toString()),
          type: this.getTypeDefAt(type.id),
        };
      },
    );

    const Clazz = createArgClass(this.inkRegistry, args, { __selector: 'u32' });

    const baseStruct: { [index: string]: any } = {
      __selector: message.selector,
    };

    const encoder = (...params: CodecArg[]): Uint8Array => {
      assert(
        params.length === args.length,
        `Expected ${args.length} arguments to contract ${name}, found ${params.length}`,
      );

      const u8a = new Clazz(
        this.inkRegistry,
        args.reduce(
          (mapped, { name }, index): Record<string, CodecArg> => {
            mapped[name] = params[index];

            return mapped;
          },
          { ...baseStruct },
        ),
      ).toU8a();

      return Compact.addLengthPrefix(u8a);
    };

    const fn = encoder as ContractABIFn;

    fn.args = args;
    fn.isConstant = !((message as any).mutates || false);
    fn.type =
      (message as any).returnType && !(message as any).returnType.isNone
        ? this.getTypeDefAt((message as any).returnType.unwrap().id)
        : null;
    return fn;
  }
}

function createArgClass(registry: InkRegistry, args: ContractABIFnArg[], baseDef: Record<string, string>): Constructor {
  return createClass(
    registry,
    JSON.stringify(
      args.reduce((base: Record<string, any>, { name, type }): Record<string, any> => {
        base[name] = type;

        return base;
      }, baseDef),
    ),
  );
}
