import { RedspotConfig } from '@redspot/config';
import { Resolver } from '@redspot/resolver';
import yargs from 'yargs';
import chalk from 'chalk';
import spawn from 'cross-spawn';
import path from 'path';
import fs from 'fs-extra';
import { NodeVM } from 'vm2';

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
  const files = getAllMigrationFile(migrationsDir);

  for (const { sequenceNo, filePath } of files) {
    await runMigration(config, filePath, migrationsDir);
  }
}

async function runMigration(config: any, filePath: string, migrationsDir: string) {
  console.log(`👉  Running migration: ${path.relative(migrationsDir, filePath)}`);

  const context = getContext(config);

  const vm = new NodeVM({
    sandbox: context,
    require: {
      builtin: ['*'],
      external: true,
    },
  });

  const content = fs.readFileSync(filePath, { encoding: 'utf8' });

  const fn = vm.run(content, filePath);

  return fn();
}

function getContext(config: RedspotConfig) {
  const resolver = new Resolver(config);

  return {
    artifacts: resolver,
  };
}

function getAllMigrationFile(dir: string) {
  const dirPath = path.relative(process.cwd(), dir);
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
