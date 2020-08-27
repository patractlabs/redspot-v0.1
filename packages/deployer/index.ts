import { KeyringPair } from '@polkadot/keyring/types';
import { RedspotConfig } from '@redspot/config';
import { Contract } from '@redspot/contract';
import { extrinsicHelper } from '@redspot/utils';
import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

class Deployer {
  #config: RedspotConfig;

  constructor(config: RedspotConfig) {
    this.#config = config;
  }

  get config() {
    return this.#config;
  }

  async putCode(contract: Contract, signer: KeyringPair): Promise<string | undefined> {
    console.log(`🚧  putCode ${chalk.cyan(contract.metadata.name)}`);
    if (!this.config.api || !(await this.config.apiReady())) throw new Error('The API is not ready');
    const outDir = this.config.outDir;
    const wasmCode = fs.readFileSync(path.join(outDir, `${contract.metadata.name}.wasm`)).toString('hex');
    const extrinsic = this.config.api.tx.contracts.putCode(`0x${wasmCode}`);
    try {
      const status = await extrinsicHelper(extrinsic, signer);
      const record = status.result.findRecord('contracts', 'CodeStored');

      if (!record) {
        throw new Error(chalk.red('ERROR: No code stored after executing putCode()'));
      }

      const codeHash = record?.event.data[0].toHex();

      if (codeHash) {
        console.log(`✅  ${chalk.cyan(contract.metadata.name)} codeHash: ${codeHash}`);
      }

      return codeHash;
    } catch (error) {
      console.log(chalk.red(`ERROR: ${error.message}`));
    }
  }
}

export { Deployer };
