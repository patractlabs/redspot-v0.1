import { RedspotConfig } from '@redspot/config';
import chalk from 'chalk';
import spawn from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';
import yargs from 'yargs';
import { checkContractCli } from '../utils/checkRustEnv';

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
  const config = new RedspotConfig('development');

  const contracts = config.getContracts(argv.package);
  const wasmFiles: string[] = [];
  const metadataFiles: string[] = [];

  console.log(
    `✨  Detect contracts: ${chalk.yellow(
      contracts.map((obj) => `${obj.name}${chalk.gray(`(${obj.manifest_path})`)}`).join(','),
    )}`,
  );
  console.log('');

  for (const contract of contracts) {
    console.log(chalk.magenta(`===== Compile ${contract.name} =====`));
    console.log('');

    try {
      await compileContracts(contract);
      wasmFiles.push(`${contract.name}.wasm`);
    } catch (reason) {
      if (reason.command) {
        console.log(`  ${chalk.cyan(reason.command)} has failed.`);
      } else {
        chalk.red('Unexpected error.');
      }
      process.exit(1);
    }
  }

  const generateMetadataContract = contracts.find((c) => path.dirname(c.manifest_path) === config.workspaceRoot);

  if (generateMetadataContract) {
    console.log('');
    console.log(chalk.magenta(`===== Generate metadata ${generateMetadataContract.name} =====`));
    console.log('');

    await generateMetadata(generateMetadataContract);

    metadataFiles.push('metadata.json');
  }
  console.log('');
  console.log(`🚚  Copy wasm files: ${wasmFiles.join(', ')}`);
  for (const filepath of wasmFiles) {
    const source = path.resolve(config.targetDirectory, filepath);
    fs.ensureDirSync(config.outDir);
    fs.copyFileSync(source, path.resolve(config.outDir, path.basename(source)));
  }

  if (metadataFiles.length) {
    console.log(`🚚  Copy abi files: ${metadataFiles.join(', ')}`);
    for (const filepath of metadataFiles) {
      const source = path.resolve(config.targetDirectory, filepath);
      const json = fs.readJsonSync(source);
      const fileName = `${json.contract.name}.json`;
      fs.ensureDirSync(config.outDir);
      fs.copyFileSync(source, path.resolve(config.outDir, path.basename(fileName)));
    }
  }

  console.log(`🎉  Compile successfully! You can find them at ${chalk.cyan(config.outDir)}`);
  console.log('');
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
    let args = [`+${argv.toolchain}`, `contract`, 'generate-metadata'];

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
