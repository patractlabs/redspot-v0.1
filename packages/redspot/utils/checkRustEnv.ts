import { execSync } from 'child_process';
import chalk from 'chalk';

export function checkContractCli() {
  try {
    execSync('cargo contract -V');
  } catch {
    console.log(chalk.red('ERROR: `cargo-contract` not found'));
    process.exit(1);
  }
}
