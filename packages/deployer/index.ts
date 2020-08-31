import { KeyringPair } from '@polkadot/keyring/types';
import { Hash } from '@polkadot/types/interfaces';
import { RedspotConfig } from '@redspot/config';
import { Contract } from '@redspot/contract';
import { extrinsicHelper } from '@redspot/utils';
import BN from 'bn.js';
import chalk from 'chalk';
import fs from 'fs-extra';
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
      throw new Error(chalk.red(`ERROR: ${error.message}`));
    }
  }

  async instantiate(
    contract: Contract,
    signer: KeyringPair,
    codeHash: Hash | string,
    inputData: any,
    endowment: number | BN = new BN('200000000000000000'),
    gasRequired: number | BN = new BN('100000000000'),
  ) {
    console.log(`🚧  instantiate ${chalk.cyan(contract.metadata.name)}`);
    if (!this.config.api || !(await this.config.apiReady())) throw new Error('The API is not ready');
    console.log('endowment: ', endowment);
    console.log('gasRequired: ', gasRequired);
    console.log('codeHash: ', codeHash);
    console.log('inputData: ', inputData);

    const extrinsic = this.config.api.tx.contracts.instantiate(endowment, gasRequired, codeHash, inputData);

    try {
      const status = await extrinsicHelper(extrinsic, signer);
      const record = status.result.findRecord('contracts', 'Instantiated');

      if (!record) {
        throw new Error(chalk.red('ERROR: No new instantiated contract'));
      }

      const address = record.event.data[1];

      if (address) {
        console.log(`✅  ${chalk.cyan(contract.metadata.name)} contract address: ${address}`);
      }

      return address;
    } catch (error) {
      throw new Error(chalk.red(`ERROR: ${error.message}`));
    }
  }
}

export { Deployer };
