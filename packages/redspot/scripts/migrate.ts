import { RedspotConfig } from '@redspot/config';
import { Resolver } from '@redspot/resolver';
import fs from 'fs-extra';
import path from 'path';
import { NodeVM } from 'vm2';
import { Deployer } from '@redspot/deployer';
import yargs from 'yargs';

process.on('unhandledRejection', (err) => {
  throw err;
});

const argv = yargs
  .usage('Usage: redspot migrate [options]')
  .option('network', {
    type: 'string',
    default: 'development',
    description: 'Specify the network to use for deployment',
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    default: false,
    description: 'Run with verbose logging',
  }).argv;

run();

async function run() {
  const config = new RedspotConfig(argv.network);

  const migrationsDir = config.migrationsDir;
  const files = getAllMigrationFile(config, migrationsDir);

  for (const { filePath } of files) {
    await runMigration(config, filePath, migrationsDir);
  }

  process.exit(0);
}

async function runMigration(config: RedspotConfig, filePath: string, migrationsDir: string) {
  console.log(`👉  Running migration: ${path.relative(migrationsDir, filePath)}`);

  await config.loadApi();
  await config.loadKeyring();

  const context = getContext(config);
  const deployer = new Deployer(config);

  const vm = new NodeVM({
    sandbox: context,
    require: {
      builtin: ['*'],
      external: true,
    },
  });

  const content = fs.readFileSync(filePath, { encoding: 'utf8' });

  const fn = vm.run(content, filePath);

  return fn(config, deployer);
}

function getContext(config: RedspotConfig) {
  const resolver = new Resolver(config);

  return {
    artifacts: resolver,
  };
}

function getAllMigrationFile(config: RedspotConfig, dir: string) {
  const dirPath = path.relative(config.workspaceRoot, dir);
  const files = fs.readdirSync(dirPath, 'utf8');

  return files
    .map((fileName) => {
      const no = parseInt(fileName);
      if (isNaN(no)) return null;
      return {
        sequenceNo: no,
        filePath: path.resolve(dirPath, fileName),
      };
    })
    .filter((x) => x)
    .sort((a, b) => (a as any).sequenceNo - (b as any).sequenceNo) as {
    sequenceNo: number;
    filePath: string;
  }[];
}
