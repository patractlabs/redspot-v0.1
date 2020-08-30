import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import createPair from '@polkadot/keyring/pair';
import { KeyringInstance } from '@polkadot/keyring/types';
import { hexToU8a } from '@polkadot/util';
import chalk from 'chalk';
import { execSync } from 'child_process';
import findUp from 'find-up';
import path from 'path';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { Option, Raw, createClass, createTypeUnsafe } from '@polkadot/types';

class RedspotConfig {
  static expectFileNames = ['redspot-config.js', 'redspotConfig.js'];

  config: any;
  networkConfig: any;
  manifest: any;
  contracts: any;
  keyring?: KeyringInstance;
  #networkName: string;
  #api?: ApiPromise;
  #provider?: WsProvider;

  constructor(networkName: string) {
    this.#networkName = networkName;
    this.manifest = this.getCargoManifest();
    this.contracts = this.getContracts();
    this.loadConfig();
  }

  get api() {
    return this.#api;
  }

  get pairs() {
    return this.keyring?.getPairs() || [];
  }

  get appPackageJson() {
    return path.resolve(this.workspaceRoot, 'package.json');
  }

  get targetDirectory() {
    return this.manifest.target_directory;
  }

  get workspaceRoot() {
    return this.manifest.workspace_root;
  }

  get provider() {
    return this.#provider;
  }

  get networkName() {
    return this.#networkName;
  }

  get outDir() {
    return path.resolve(this.workspaceRoot, this.config.outDir || './artifacts');
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
    await cryptoWaitReady();
    this.keyring = this.createKeyring();
  }

  loadConfig() {
    const configPath = this.detectConfig();

    delete require.cache[path.resolve(configPath)];

    const config = require(configPath);

    this.config = config;

    this.networkConfig = config?.networks?.[this.networkName];
  }

  createType(type: string, data: any) {
    if (this.api?.registry) {
      return createTypeUnsafe(this.api.registry, type, [data], true);
    } else {
      throw new Error('the api is not initialized');
    }
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

  getCargoManifest() {
    const execCommand = 'cargo metadata --no-deps --format-version 1';
    try {
      const output = execSync(execCommand, { maxBuffer: 1024 * 2048 }).toString();
      return JSON.parse(output);
    } catch (error) {
      throw new Error(chalk.red(`\`${execCommand}\` has failed`));
    }
  }

  getContracts(contractName?: string): any[] {
    const contracts = this.manifest.packages
      .filter(({ id, dependencies }: { id: string; dependencies: any }) => {
        return (
          (this.manifest.workspace_members || []).includes(id) &&
          !!dependencies.find(({ name }: any) => name === 'ink_core')
        );
      })
      .filter(({ name }: any) => !contractName || name === contractName);

    if (!contracts.length) {
      throw new Error(`Contract ${chalk.cyan(contractName)} cannot be found`);
    }

    return contracts;
  }
}

export { RedspotConfig };
