import { execSync } from 'child_process';
import chalk from 'chalk';

class Contract {
  contractMetadata: any;

  constructor(contractMetadata: any) {
    this.contractMetadata = contractMetadata;
  }
}

export default Contract;
