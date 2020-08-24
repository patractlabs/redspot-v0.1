import yargs from 'yargs';
import chalk from 'chalk';
import spawn from 'cross-spawn';
import { checkContractCli } from '../utils/checkRustEnv';
import { getContracts } from '../utils/cargoMetadata';
import path from 'path';

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

const contracts = getContracts(argv.package);

console.log(`🔖  Find contracts: ${chalk.yellow(contracts.map((obj) => obj.name).join(','))}`);

checkContractCli();
run();

async function run() {
  for (const contract of contracts) {
    console.log(`👉  Compile contract: ${chalk.yellow(contract.name)}`);
    try {
      await compileContracts(contract);
      await generateMetadata(contract);
    } catch (reason) {
      if (reason.command) {
        console.log(`  ${chalk.cyan(reason.command)} has failed.`);
      } else {
        chalk.red('Unexpected error.');
      }
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