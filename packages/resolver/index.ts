import { RedspotConfig } from '@redspot/config';
import { Contract } from '@redspot/contract';
import chalk from 'chalk';
import { execSync } from 'child_process';

class Resolver {
  metadata: any;
  #config: RedspotConfig;
  contracts: any[];

  constructor(config: RedspotConfig) {
    this.#config = config;
    this.metadata = this.getCargoMetadata();
    this.contracts = this.getContracts();
  }

  get config() {
    return this.#config;
  }

  require(contractName: string) {
    const contractMetadata = this.contracts.find(({ name }: any) => name === contractName);
    if (!contractMetadata) {
      throw new Error(`The specified contract name ${chalk.cyan(contractName)} could not be found`);
    }

    const contract = new Contract(this.config, contractMetadata);

    return contract;
  }

  getCargoMetadata() {
    const execCommand = 'cargo metadata --no-deps --format-version 1';
    try {
      const output = execSync(execCommand, { maxBuffer: 1024 * 2048 }).toString();
      return JSON.parse(output);
    } catch (error) {
      throw new Error(chalk.red(`\`${execCommand}\` has failed`));
    }
  }

  getContracts(contractName?: string): any[] {
    const contracts = this.metadata.packages
      .filter(({ id, dependencies }: { id: string; dependencies: any }) => {
        return (
          (this.metadata.workspace_members || []).includes(id) &&
          !!dependencies.find(({ name }: any) => name === 'ink_core')
        );
      })
      .filter(({ name }: any) => !contractName || name === contractName);

    if (!contracts.length) {
      throw new Error(`No contract lib could be found`);
    }

    return contracts;
  }
}

export { Resolver };
