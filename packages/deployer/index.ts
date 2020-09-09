import { KeyringPair } from '@polkadot/keyring/types';
import { Hash } from '@polkadot/types/interfaces';
import { RedspotConfig } from '@redspot/config';
import { Contract } from '@redspot/contract';
import { extrinsicHelper } from '@redspot/utils';
import BN from 'bn.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import prettyjson from 'prettyjson';

class Deployer {
  #config: RedspotConfig;

  constructor(config: RedspotConfig) {
    this.#config = config;
  }

  get config() {
    return this.#config;
  }

  async putCode(contract: Contract, signer: KeyringPair): Promise<string | undefined> {
    if (!this.config.api || !(await this.config.apiReady())) throw new Error('The API is not ready');
    const outDir = this.config.outDir;
    const wasmCode = fs.readFileSync(path.join(outDir, `${contract.metadata.name}.wasm`)).toString('hex');
    const extrinsic = this.config.api.tx.contracts.putCode(`0x${wasmCode}`);
    console.log('');
    console.log(chalk.magenta(`===== PutCode ${contract.metadata.name} =====`));
    console.log(
      prettyjson.render({
        WasmCode: `0x${wasmCode}`.replace(/^(\w{32})(\w*)(\w{30})$/g, '$1......$3'),
      }),
    );
    try {
      const status = await extrinsicHelper(extrinsic, signer);
      const record = status.result.findRecord('contracts', 'CodeStored');

      if (!record) {
        throw new Error(chalk.red('ERROR: No code stored after executing putCode()'));
      }

      const codeHash = record?.event.data[0].toHex();

      if (codeHash) {
        console.log(`➤ ${contract.metadata.name} codeHash: ${chalk.blue(codeHash)}`);
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
    endowment: number | BN = new BN('2000000000000000'),
    gasRequired: number | BN = new BN('10000000000'),
  ) {
    if (!this.config.api || !(await this.config.apiReady())) throw new Error('The API is not ready');
    console.log('');
    console.log(chalk.magenta(`===== Instantiate ${contract.metadata.name} =====`));
    console.log(
      prettyjson.render({
        Endowment: `${endowment}`,
        GasRequired: `${gasRequired}`,
        CodeHash: `${codeHash}`,
        InputData: `${inputData}`,
      }),
    );

    const extrinsic = this.config.api.tx.contracts.instantiate(endowment, gasRequired, codeHash, inputData);

    try {
      const status = await extrinsicHelper(extrinsic, signer);
      const record = status.result.findRecord('contracts', 'Instantiated');

      if (!record) {
        throw new Error(chalk.red('ERROR: No new instantiated contract'));
      }

      const address = record.event.data[1];

      if (address) {
        console.log(`➤ ${contract.metadata.name} contract address: ${chalk.blue(address)}`);
      }

      return address;
    } catch (error) {
      throw new Error(chalk.red(`ERROR: ${error.message}`));
    }
  }
}

export { Deployer };
