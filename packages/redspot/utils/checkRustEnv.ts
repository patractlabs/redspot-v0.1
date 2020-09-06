import { execSync } from 'child_process';
import chalk from 'chalk';
import semver from 'semver';

export function checkContractCli() {
  let version: string;
  try {
    const versionData = execSync('cargo contract -V');
    version = versionData.toString().split(' ')[1];
  } catch {
    console.log(chalk.red('ERROR: No `cargo-contract` found'));
    console.log(`Run the following command to install it:`);
    console.log(
      chalk.cyan(`$ cargo install --git https://github.com/paritytech/cargo-contract cargo-contract --force`),
    );
    process.exit(1);
  }

  if (semver.lt(version, '0.7.0')) {
    console.log(chalk.red('ERROR: `cargo-contract` requires v0.7.0 or above'));
    console.log(`Run the following command to install it:`);
    console.log(
      chalk.cyan(`$ cargo install --git https://github.com/paritytech/cargo-contract cargo-contract --force`),
    );
    process.exit(1);
  }
}
