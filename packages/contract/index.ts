import { RedspotConfig } from '@redspot/config';
import { Abi } from '@redspot/api-contract';
import { Deployer } from '@redspot/deployer';
import path from 'path';
import fs from 'fs-extra';
import { KeyringPair } from '@polkadot/keyring/types';
import { Hash } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { ContractApi } from './ContractApi';
import chalk from 'chalk';
import prettyjson from 'prettyjson';

class Contract {
  #metadata: any;
  #config: RedspotConfig;
  #abi?: Abi;

  constructor(config: RedspotConfig, metadata: any) {
    this.#config = config;
    this.#metadata = metadata;
    this.#abi = this.loadAbi();
  }

  get abi() {
    return this.#abi;
  }

  get config() {
    return this.#config;
  }

  get metadata() {
    return this.#metadata;
  }

  loadAbi() {
    const outDir = this.config.outDir;
    const abiPath = path.join(outDir, `${this.metadata.name}.json`);
    let abiJSON: Record<string, any> | undefined;

    try {
      abiJSON = fs.readJSONSync(abiPath);
    } catch (error) {
      console.log(`Unable to find abi file ${abiPath}`);
    }

    return abiJSON && new Abi(abiJSON);
  }

  async putCode(signer: KeyringPair) {
    const deployer = new Deployer(this.config);
    return deployer.putCode(this, signer);
  }

  async instantiate(
    signer: KeyringPair,
    codeHash: Hash | string,
    inputData: any,
    endowment: number | BN = new BN('50000000000'),
    gasRequired: number | BN = new BN('300000000'),
    options?: any,
  ) {
    const deployer = new Deployer(this.config);
    return deployer.instantiate(this, signer, codeHash, inputData, endowment, gasRequired);
  }

  load(address: string, options?: any) {
    if (!this.config.api) {
      throw new Error(chalk.red('ERROR: NEED API'));
    }
    if (!this.abi) {
      throw new Error(`ERROR: Unable to find the abi file for ${chalk.yellow(this.metadata.name)}`);
    }

    console.log(`✨  Load contract instance: ${chalk.blue(address.toString())}`);

    return new ContractApi(this.config.api, this.abi, address.toString(), options);
  }

  async deployed(
    signer: KeyringPair,
    codeHash: Hash | string,
    inputData: any,
    endowment: number | BN = new BN('50000000000'),
    gasRequired: number | BN = new BN('300000000'),
    options?: any,
  ) {
    const deployer = new Deployer(this.config);
    const address = await deployer.instantiate(this, signer, codeHash, inputData, endowment, gasRequired);

    if (!this.config.api) {
      throw new Error(chalk.red('ERROR: NEED API'));
    }
    if (!this.abi) {
      throw new Error(`ERROR: Unable to find the abi file for ${chalk.yellow(this.metadata.name)}`);
    }

    console.log(`✨  Load contract instance: ${chalk.blue(address.toString())}`);

    return new ContractApi(this.config.api, this.abi, address.toString(), options);
  }
}

export { Contract };
