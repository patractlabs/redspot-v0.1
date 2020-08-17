import { execSync } from 'child_process';
import chalk from 'chalk';

export function getCargoMetadata() {
  const execCommand = 'cargo metadata --no-deps --format-version 1';
  try {
    const output = execSync(execCommand, { maxBuffer: 1024 * 2048 }).toString();
    return JSON.parse(output);
  } catch (error) {
    console.log(chalk.red(`\`${execCommand}\` has failed`));
    process.exit(1);
  }
}

export function getContracts(contractName?: string): any[] {
  const metadata = getCargoMetadata();
  const contracts = metadata.packages
    .filter(({ id, dependencies }: { id: string; dependencies: any }) => {
      return (
        (metadata.workspace_members || []).includes(id) && !!dependencies.find(({ name }: any) => name === 'ink_core')
      );
    })
    .filter(({ name }: any) => !contractName || name === contractName);

  if (!contracts.length) {
    console.log(chalk.red(`No contract lib could be found`));
    process.exit(1);
  }
  return contracts;
}
