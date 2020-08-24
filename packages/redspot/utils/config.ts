import chalk from 'chalk';
import findUp from 'find-up';
import path from 'path';

const expectFileNames = ['redspot-config.js', 'redspotConfig.js'];

function detectConfig(): string {
  for (const filename of expectFileNames) {
    const file = findUp.sync(filename);

    if (file) return file;
  }

  console.log(chalk.red('ERROR: Could not find suitable configuration file.'));
  console.log(`Please make sure ${chalk.yellow('redspot-config.js')} is in your project`);

  return process.exit(0);
}

function loadConfig() {
  const configPath = detectConfig();

  delete require.cache[path.resolve(configPath)];

  var config = require(configPath);

  return {
    get networks() {
      return config.networks;
    },
  };
}

export { loadConfig };
