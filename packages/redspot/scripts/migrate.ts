import { loadConfig } from '../utils/config';
import yargs from 'yargs';
import chalk from 'chalk';
import spawn from 'cross-spawn';
import { checkContractCli } from '../utils/checkRustEnv';
import { getContracts } from '../utils/cargoMetadata';
import path from 'path';

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

}
