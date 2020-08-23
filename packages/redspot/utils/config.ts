import path from 'path';
import fs from 'fs-extra';
import findUp from 'find-up';
import chalk from 'chalk';

const expectFileNames = ['redspot-config.js', 'redspotConfig.js'];

function detectConfig() {
  for (const filename of expectFileNames) {
    const file = findUp.sync(filename);

    if (file) return file;
  }

  console.log(chalk.red('ERROR: Could not find suitable configuration file.'));
  console.log(`Please make sure ${chalk.yellow('redspot-config.js')} is in your project`);

  process.exit(0);
}

function loadConfig() {
  const config = detectConfig();

  console.log(config);
}

export { loadConfig };
