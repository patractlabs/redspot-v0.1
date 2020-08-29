import NodeEnvironment from 'jest-environment-node';
import { RedspotConfig } from '@redspot/config';
import { Resolver } from '@redspot/resolver';

class RedSpotTestEnv extends NodeEnvironment {
  async setup() {
    await super.setup();
    //@ts-ignore
    this.context.config = new RedspotConfig(this.context?.network);
    //@ts-ignore
    this.context.artifacts = new Resolver(this.context.config);
  }

  async teardown() {
    //@ts-ignore
    this.context.config?.api.disconnect();
    await super.teardown();
  }
}

export default RedSpotTestEnv;
