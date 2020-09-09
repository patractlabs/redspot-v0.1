# Redspot
Redspot is named after Jupiter's Great Red Spot, which is also the largest DOT in the solar system. Redspot's target project is Truffle (https://github.com/trufflesuite/truffle) in Truffle Suite. Redspot is a development environment, testing framework and asset pipeline for pallet-contracts. Redspot is trying to let the development of ink! be projectized and simplify the testing and interacting with contracts.

In Redspot v0.1, we will finish：

1. Can read a config file and generate a contract project's framework, including contract source and tests directories. Redspot's command can recognise the structure of the project and distinguish the corresponding file locations.
2. Provide some simple commands to do the actions, such as "compile", "test" and "deploy".
3. Connect with different RPCs of substrate nodes depending on a config, then do test, deployment, etc.
4. Integrate polkadot.js for tests and connect with nodes.


## Get Started Immediately

```bash
$ npx redspot-new flipper
```

(npx is a package runner tool that comes with npm 5.2+ and higher, it ensures that you always install the latest version)

Redspot will create a directory called my-app inside the current folder.

Once the installation is done, you can open your project folder:

```bash
$ cd flipper
```

Inside the newly created project, you can run some built-in commands:

### `npm run build` or `yarn build`

Compile your contract into wasm

### `npm run test` or `yarn test`

Test your contract

### `npm run migrate` or `yarn migrate`

Migrate your contract


