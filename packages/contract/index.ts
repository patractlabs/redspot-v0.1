import { execSync } from 'child_process';
import chalk from 'chalk';

class Contract {
  #metadata: any;

  constructor(metadata: any) {
    this.#metadata = metadata;
  }

  get metadata() {
    return this.#metadata;
  }
}

export default Contract;
