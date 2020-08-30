// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import erc20 from '../../test/abi/v3-erc20.json'
import Abi from '../Abi';

describe('Abi', (): void => {
  describe('erc20', (): void => {
    let abi: Abi;

    beforeEach((): void => {
      abi = new Abi(erc20);
    });

    it('has the attached methods', (): void => {
      console.log(abi)
      expect(Object.values(abi.abi.spec.messages).map(({ name }): string => name)).toEqual(
        ['inc', 'get', 'compare']
      );
    });
  });
});
