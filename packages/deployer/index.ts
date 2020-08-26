import { KeyringPair } from '@polkadot/keyring/types';
import { RedspotConfig } from '@redspot/config';
import { Contract } from '@redspot/contract';
import { extrinsicHelper } from '@redspot/utils';
import fs from 'fs-extra';
import chalk from 'chalk';

class Deployer {
  #config: RedspotConfig;

  constructor(config: RedspotConfig) {
    this.#config = config;
  }

  get config() {
    return this.#config;
  }

  async putCode(contract: Contract, signer: KeyringPair) {
    if (!this.config.api || (await this.config.apiReady())) throw new Error('The API is not ready');
    const outDir = this.config.outDir;
    const wasmCode = fs.readFileSync(outDir).toString('hex');
    const extrinsic = this.config.api.tx.contracts.putCode(`0x${wasmCode}`);
    try {
      const status = await extrinsicHelper(extrinsic, signer);
      const record = status.result.findRecord('contracts', 'CodeStored');

      if (!record) {
        console.log(chalk.red('ERROR: No code stored after executing putCode()'));
      }

      return record?.event.data[0];
    } catch (error) {
      console.log(chalk.red(`ERROR: ${error.message}`));
    }
  }
}

export { Deployer };
