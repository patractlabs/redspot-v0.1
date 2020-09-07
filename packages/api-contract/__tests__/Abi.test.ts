// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import erc20 from './v3-erc20.json';
import Abi from '../src/Abi';

describe('Abi', (): void => {
  describe('erc20', (): void => {
    let abi: Abi;

    beforeEach((): void => {
      abi = new Abi(erc20);
    });

    it('has the attached methods', (): void => {
      const result = abi.createEventData(
        '0x0001d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d018eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48a0860100000000000000000000000000'
      );

      console.log(result);
    });
  });
});
