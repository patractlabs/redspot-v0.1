import chalk from 'chalk';
import findUp from 'find-up';
import path from 'path';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { KeyringInstance, KeyringOptions } from '@polkadot/keyring/types';
import { Keyring } from '@polkadot/keyring';
import { hexToU8a } from '@polkadot/util';
import createPair from '@polkadot/keyring/pair';

class RedspotConfig {
  static expectFileNames = ['redspot-config.js', 'redspotConfig.js'];

  cwd: string;
  config: any;
  networkConfig: any;
  keyring?: KeyringInstance;
  #networkName: string;
  #api?: ApiPromise;
  #provider?: WsProvider;

  constructor(networkName: string, cwd: string) {
    this.cwd = cwd;
    this.#networkName = networkName;
    this.loadConfig();
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

  async loadApi() {
    this.#provider = new WsProvider(this.endpoints);
    this.#api = new ApiPromise({
      provider: this.#provider,
      types: this.networkConfig.types || {},
    });
    return this.#api.isReady;
  }

  async loadKeyring() {
    this.keyring = this.createKeyring();
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

    pairs.forEach(
      ({
        name,
        publicKey,
        secretKey,
        type = 'sr25519',
      }: {
        name: string;
        publicKey: string;
        secretKey: string;
        type: 'sr25519';
      }): void => {
        const meta = {
          isTesting: true,
          name: name,
        };

        const pair = keyring.addPair(
          createPair(
            { toSS58: keyring.encodeAddress, type },
            { publicKey: hexToU8a(publicKey), secretKey: hexToU8a(secretKey) },
            meta,
          ),
        );

        pair.lock = () => {};
      },
    );

    return keyring;
  }
}

export { RedspotConfig };
