// Copyright 2017-2019 @polkadot/rpc-core authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { TypeRegistry } from '@polkadot/types';
import definitions from './contractsAbi/definitions';

class InkRegistry extends TypeRegistry {
  constructor() {
    super();
    this.register(definitions.types as any);
  }
}

export default InkRegistry;
