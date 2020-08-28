import NodeEnvironment from 'jest-environment-node';
import { RedspotConfig } from '@redspot/config';

class RedSpotTestEnv extends NodeEnvironment {
  async setup() {
    await super.setup();
    //@ts-ignore
    this.context.config = new RedspotConfig(this.context?.network);
  }

  async teardown() {
    await super.teardown();
  }
}

export default RedSpotTestEnv;
