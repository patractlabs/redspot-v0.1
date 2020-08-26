import { execSync } from 'child_process';
import chalk from 'chalk';
import { RedspotConfig } from '@redspot/config';

class Contract {
  #metadata: any;
  #config: RedspotConfig;

  constructor(config: RedspotConfig, metadata: any) {
    this.#config = config;
    this.#metadata = metadata;
  }

  get config() {
    return this.#config;
  }

  get metadata() {
    return this.#metadata;
  }
}

export default Contract;
