import chalk from 'chalk';
import findUp from 'find-up';
import path from 'path';
import { ApiPromise, WsProvider } from '@polkadot/api';

class RedspotConfig {
  static expectFileNames = ['redspot-config.js', 'redspotConfig.js'];

  config: any;
  networkConfig: any;
  _networkName: string;
  #api?: ApiPromise;
  #provider?: WsProvider;

  constructor(networkName = 'development') {
    this._networkName = networkName;
    this.loadConfig();
  }

  get api() {
    return this.#api;
  }

  get provider() {
    return this.#provider;
  }

  get networkName() {
    return this._networkName;
  }

  get endpoints() {
    if (!this.networkConfig) {
      throw new Error(`The endpoints for ${this.networkName} could not be found`);
    }

    return this.networkConfig.endpoints;
  }

  get migrationsDir() {
    return 'migrations';
  }

  apiReady() {
    return this.#api ? this.#api.isReady : Promise.resolve(false);
  }

  loadApi() {
    this.#provider = new WsProvider(this.endpoints);
    this.#api = new ApiPromise({
      provider: this.#provider,
    });
  }

  loadConfig() {
    const configPath = this.detectConfig();

    delete require.cache[path.resolve(configPath)];

    const config = require(configPath);

    this.config = config;

    this.networkConfig = config?.networks?.[this.networkName];
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
