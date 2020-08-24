import chalk from 'chalk';
import findUp from 'find-up';
import path from 'path';

class RedspotConfig {
  static expectFileNames = ['redspot-config.js', 'redspotConfig.js'];

  config: any;

  constructor() {
    this.load();
  }

  get networks() {
    return this.config.networks;
  }

  load() {
    const configPath = this.detectConfig();

    delete require.cache[path.resolve(configPath)];

    const config = require(configPath);

    this.config = config;
  }

  detectConfig(): string {
    for (const filename of RedspotConfig.expectFileNames) {
      const file = findUp.sync(filename);

      if (file) return file;
    }

    throw new Error(chalk.red('ERROR: Could not find suitable configuration file.'));
  }
}

export { RedspotConfig };
