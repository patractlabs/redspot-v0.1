import { Resolver } from '@redspot/resolver';
import chalk from 'chalk';
import spawn from 'cross-spawn';
import path from 'path';
import yargs from 'yargs';
import { checkContractCli } from '../utils/checkRustEnv';
import { RedspotConfig } from '@redspot/config';

process.on('unhandledRejection', (err) => {
  throw err;
});

const argv = yargs
  .usage('Usage: redspot compile [ContractPathName]')
  .option('toolchain', {
    type: 'string',
    default: 'nightly',
    description: 'Specified the toolchain',
  })
  .option('package', {
    type: 'string',
    description: 'Compile specified contracts',
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    default: false,
    description: 'Run with verbose logging',
  }).argv;

run();

async function run() {
  checkContractCli();
  const config = new RedspotConfig();
  const resolver = new Resolver(config);

  const contracts = resolver.getContracts(argv.package);

  console.log(`🔖  Find contracts: ${chalk.yellow(contracts.map((obj) => obj.name).join(','))}`);

  for (const contract of contracts) {
    console.log(`👉  Compile contract: ${chalk.yellow(contract.name)}`);
    try {
      await compileContracts(contract);
    } catch (reason) {
      if (reason.command) {
        console.log(`  ${chalk.cyan(reason.command)} has failed.`);
      } else {
        chalk.red('Unexpected error.');
      }
      process.exit(1);
    }
  }
}

function compileContracts(contract: any) {
  return new Promise((resolve, reject) => {
    let args = [`+${argv.toolchain}`, `contract`, 'build'];
    if (argv.verbose) {
      args = args.concat('--', 'verbose');
    }

    const child = spawn('cargo', args, {
      stdio: 'inherit',
      cwd: path.dirname(contract.manifest_path),
    });

    console.log(`cargo ${args.join(' ')}`);

    child.on('close', (code) => {
      if (code !== 0) {
        console.log();
        console.log(chalk.red(`Failed to compile the contract ${chalk.yellow(contract.name)}`));
        reject({
          command: `cargo ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

function generateMetadata(contract: any) {
  return new Promise((resolve, reject) => {
    let args = ['run', '--', 'package', 'abi-gen', '--', 'release'];

    if (argv.verbose) {
      args = args.concat('--', 'verbose');
    }

    const child = spawn('cargo', args, {
      stdio: 'inherit',
    });

    console.log(`cargo ${args.join(' ')}`);

    child.on('close', (code) => {
      if (code !== 0) {
        console.log();
        console.log(chalk.red(`Failed to generate the metadata ${chalk.yellow(contract.name)}`));
        reject({
          command: `cargo ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}
