# Redspot
Redspot is named after Jupiter's Great Red Spot, which is also the largest DOT in the solar system. Redspot’s target project is Truffle (https://github.com/trufflesuite/truffle) in Truffle Suite. Redspot is a development environment, testing framework and asset pipeline for pallet-contracts. Redspot is trying to let the development of ink! be projectized and simplify the testing and interacting with contracts.

In Redspot v0.1, we will finish：

1. Can read a config file and generate a contract project’s framework, including contract source and tests directories. Redspot’s command can recognise the structure of the project and distinguish the corresponding file locations.
2. Provide some simple commands to do the actions, such as “compile”, “test” and “deploy”.
3. Connect with different RPCs of substrate nodes depending on a config, then do test, deployment, etc.
4. Integrate polkadot.js for tests and connect with nodes.

## Quick Start

```bash
  npx redspot-new flipper
```