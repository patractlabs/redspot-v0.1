import { RedspotConfig } from '@redspot/config';
import * as jest from 'jest';
import path from 'path';
import yargs from 'yargs';
import { createJestConfig } from '../utils/createJestConfig';

process.on('unhandledRejection', (err) => {
  throw err;
});

run();

async function run() {
  const argv = process.argv.slice(2);

  const parseArgv = yargs.parse(argv);

  const network = typeof parseArgv.network === 'string' ? parseArgv.network : 'development';

  const config = new RedspotConfig(network);

  argv.push('--config', JSON.stringify(createJestConfig(network, path.resolve(config.workspaceRoot))));

  const cleanArgv = clearArgv(argv);

  jest.run(cleanArgv);
}

function clearArgv(argv: string[]) {
  let clean = [];
  let next: string;

  while (argv.length > 0) {
    next = argv.shift() as string;
    if (next === '--network') {
      if (argv[0]?.indexOf('-') !== 0) {
        argv.shift();
      }
    } else if (!next.includes('--network=')) {
      clean.push(next);
    }
  }

  return clean;
}
