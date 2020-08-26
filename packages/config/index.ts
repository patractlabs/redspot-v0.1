import chalk from 'chalk';
import findUp from 'find-up';
import path from 'path';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { KeyringInstance, KeyringOptions } from '@polkadot/keyring/types';
import { Keyring } from '@polkadot/keyring';

class RedspotConfig {
  static expectFileNames = ['redspot-config.js', 'redspotConfig.js'];

  cwd: string;
  config: any;
  networkConfig: any;
  keyring: KeyringInstance;
  #networkName: string;
  #api?: ApiPromise;
  #provider?: WsProvider;

  constructor(networkName: string, cwd: string) {
    this.cwd = cwd;
    this.#networkName = networkName;
    this.loadConfig();
    this.keyring = this.createKeyring();
  }

  get api() {
    return this.#api;
  }

  get provider() {
    return this.#provider;
  }

  get networkName() {
    return this.#networkName;
  }

  get outDir() {
    return path.resolve(this.cwd, this.config.outDir || './artifacts');
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

  createKeyring(): KeyringInstance {
    const keyring = new Keyring({
      ss58Format: this.networkConfig.prefix || 42,
    });
    const pairs = this.networkConfig.accounts || [];

    pairs.forEach(({ name, seed, type = 'sr25519' }: { name: string; seed: string; type: string }): void => {
      const meta = {
        isTesting: true,
        name: name || seed.replace('//', '_').toLowerCase(),
      };

      const pair = keyring.addFromUri(seed, meta, type as 'sr25519');

      pair.lock = () => {};
    });

    return keyring;
  }
}

export { RedspotConfig };
