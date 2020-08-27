import { RedspotConfig } from '@redspot/config';
import { Contract } from '@redspot/contract';
import chalk from 'chalk';

class Resolver {
  metadata: any;
  #config: RedspotConfig;

  constructor(config: RedspotConfig) {
    this.#config = config;
  }

  get config() {
    return this.#config;
  }

  require(contractName: string) {
    const contractMetadata = this.config.contracts.find(({ name }: any) => name === contractName);
    if (!contractMetadata) {
      throw new Error(`The specified contract name ${chalk.cyan(contractName)} could not be found`);
    }

    const contract = new Contract(this.config, contractMetadata);

    return contract;
  }
}

export { Resolver };
