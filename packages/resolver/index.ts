import { execSync } from 'child_process';
import chalk from 'chalk';

class Resolver {
  metadata: any;
  contracts: any[];

  constructor() {
    this.metadata = this.getCargoMetadata();
    this.contracts = this.getContracts();
  }

  require(contractName: string) {
    const contractInfo = this.contracts.find(({ name }: any) => name === contractName);
    if (!contractInfo) {
      throw new Error('The specified contract name could not be found');
    }
    return contractInfo;
  }

  getCargoMetadata() {
    const execCommand = 'cargo metadata --no-deps --format-version 1';
    try {
      const output = execSync(execCommand, { maxBuffer: 1024 * 2048 }).toString();
      return JSON.parse(output);
    } catch (error) {
      console.log(chalk.red(`\`${execCommand}\` has failed`));
      process.exit(1);
    }
  }

  // @TODO hard code
  getContracts(): any[] {
    const contracts = this.metadata.packages.filter(({ id, dependencies }: { id: string; dependencies: any }) => {
      return (
        (this.metadata.workspace_members || []).includes(id) &&
        !!dependencies.find(({ name }: any) => name === 'ink_core')
      );
    });

    if (!contracts.length) {
      console.log(chalk.red(`No contract lib could be found`));
      process.exit(1);
    }
    return contracts;
  }
}

export default Resolver;
