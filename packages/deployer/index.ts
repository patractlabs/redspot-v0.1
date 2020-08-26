import { RedspotConfig } from '@redspot/config';
import { Contract } from '@redspot/contract';
import fs from 'fs-extra';

class Deployer {
  #config: RedspotConfig;

  constructor(config: RedspotConfig) {
    this.#config = config;
  }

  get config() {
    return this.#config;
  }

  async putCode(contract: Contract) {
    const outDir = this.config.outDir;
    const wasmCode = fs.readFileSync(outDir).toString('hex');
    const tx = this.config.api?.tx.contracts.putCode(`0x${wasmCode}`);
  }
}

export { Deployer };
