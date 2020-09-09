# Redspot
Redspot is named after Jupiter's Great Red Spot, which is also the largest DOT in the solar system. Redspot's target project is Truffle (https://github.com/trufflesuite/truffle) in Truffle Suite. Redspot is a development environment, testing framework and asset pipeline for pallet-contracts. Redspot is trying to let the development of ink! be projectized and simplify the testing and interacting with contracts.

In Redspot v0.1, we will finish：

1. Can read a config file and generate a contract project's framework, including contract source and tests directories. Redspot's command can recognise the structure of the project and distinguish the corresponding file locations.
2. Provide some simple commands to do the actions, such as "compile", "test" and "deploy".
3. Connect with different RPCs of substrate nodes depending on a config, then do test, deployment, etc.
4. Integrate polkadot.js for tests and connect with nodes.

Table of Contents
=================

  * [Get Started Immediately](#get-started-immediately)
  * [Install from template](#install-from-template)
  * [Directory tree](#directory-tree)
  * [Project config](#project-config)
  * [Compile contract](#compile-contract)
  * [Contect nodes](#contect-nodes)
  * [Test contract](#test-contract)
  * [Deploy contract](#deploy-contract)
  * [config](#config)
    * [config.api](#configapi)
    * [config.pairs](#configpairs)
  * [artifacts](#artifacts)
    * [contract.putCode](#contractputcodesigner-keyringpair)
    * [contract.instantiate](#contractinstantiatesigner-keyringpair-codehash-hash--string-inputdata-any-endowment-number--bn--new-bn10000000000-gasrequired-number--bn--new-bn10000000000)
    * [contract.deployed](#contractdeployedsigner-keyringpair-codehash-hash--string-inputdata-any-endowment-number--bn--new-bn10000000000-gasrequired-number--bn--new-bn10000000000)
    * [contract.load](#contractloadaddress-string)
  * [contractApi](#contractapi)

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

![](https://user-images.githubusercontent.com/69485494/92663579-cae50d80-f355-11ea-93ce-fce832fa1a00.png)


## Install from template

Redspot provides several contract templates: `flipper`,  `delegator` , `dns`, `erc20`, `erc721` , `incrementer`, `multisig_plain`. You can intall them like this:

```bash
$ npx install <app-name> --template <template-name>
```

For instance: `npx install erc20 --template erc20`

The default contract template is `flipper`.

## Directory tree

```
app-name/
 .vscode/
  launch.json
 artifacts/
  migrations/
   1_deploy_contracts.js
  node_modules/
  tests/
   <template-name>.test.js
  Cargo.toml
  lib.rs
  package.json
  redspot-config.js
```

The files generated by `yarn build` are in `artifacts` folder by default.

`migrations` keeps `migrate` files which are called by `yarn migrate`.

`test` keeps test files.

`lib.rs` is your main contract code.  Sub-contract code can be put in anywhere. (Please refer to `delegator` contract)

`redspot-config.js` is some default project config.

## Project config

You can set up your project config in `redspot-config.js`,  here are the config settings in `redspot-config.js`:

```
module.exports = {
  // Compilation output directory
  outDir: './artifacts',
  // Can add custom network name like: product, local
  networks: {
    // Network name
    development: {
      // types will be added to polkadot-js
      types: {
       	// Address: "AccountId",
        // LookupSource: "AccountId",
      },
      // The endpoint url must be websocket one
      endpoints: ['ws://127.0.0.1:9944'],
      // Default account settings
      accounts: [
        {
          name: 'alice',
          publicKey: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
          secretKey:
        '0x98319d4ff8a9508c4bb0cf0b5a78d760a0b2082c02775e6e82370816fedfff48925a225d97aa00682d6a59b95b18780c10d7032336e88f3442b42361f4a66011',
        },
      ],
    },
  },
};
```



## Compile contract

Use command `yarn build` to compile the contracts and abi files used for generating contracts in project. This command can compile both main contract and sub-contract, but please notice that it can only produce the abi files of the main contract. (Will be resolved in the future https://github.com/paritytech/cargo-contract/issues/60)

Prerequisites:

- rust-src: `rustup component add rust-src`
- wasm-opt: https://github.com/WebAssembly/binaryen#tools
- cargo contract v0.7.0: `cargo install --git https://github.com/paritytech/cargo-contract cargo-contract --force`
- rust nightly: https://rust-lang.github.io/rustup/installation/index.html#installing-nightly

You can specify the contract name to compile, by default it compiles all contracts in the workspace.

```bash
$ yarn build --package <ContractName>
```

You can also specify the toolchain needed by compilation. The default one is nightly:

```bash
$ yarn build --toolchain stable
```

The files generated by compilation will be in `artifacts` directory by default.

## Contect nodes

Redspot only supports the substrate rc6, you can compile the latest substrate code, or using our substrate contract test chain Jupiter (https://github.com/patractlabs/jupiter) for development. Jupiter has been done some optimization on contract test.

Please take a notice, for some chains (like Jupiter), they require adding some types in ``  redspot-config.js`` to make them work, otherwise may end up with signature error.

```
types: {
  Address: "AccountId",
  LookupSource: "AccountId",
}
```

## Test contract

Redspot uses [jest](https://jestjs.io/docs/en/getting-started) as the test framework. You can pass jest cli options to `yarn test` command like this:

```
yarn test --runInBand
```

The above command indicates that jest will excute the test files by sequence.

Specially: you can specify the network you want by `yarn test --network <networkname>`.

All `<name>.test.js` files inside the tests directory will get tested and each file has its independent sandbox environment.

Global variables [config](#config) and [artifacts](#artifacts) are injected to the test files.

**Heads up, if contract code has been updated, please rum `yarn build` first to compile the project then run `yarn test` to test it.**

## Deploy contract

`yarn migrate` will excute the files in `migrateions` directory, the prefix numbers in filenames indicate the excute order.

Run `yarn migrate --network <networkname>` to specify the network you want to link.

Similarly,  global variables [config](#config) and [artifacts](#artifacts) are injected to the migrate files as well.

## config

Global variable `config` keeps your project configurations and api object.

#### config.api

The api object used to be injected to polkadot.

#### config.pairs

The accounts set in `redspot-config.js`

## artifacts

You can get an abstract contract instance by calling `const contract = artifacts.require(<contractName>)`. It also has some other functions: `putCode`,  `instantiate`, `deployed`,  `load`.

#### contract.putCode(signer: KeyringPair)

Find the paring wasm files automatically and upload to test net.

#### contract.instantiate(signer: KeyringPair, codeHash: Hash | string, inputData: any, endowment: number | BN = new BN('10000000000'), gasRequired: number | BN = new BN('10000000000'))

By instantiating the contract with the given parameters, the function will get an instantiated contract address. **Heads up: the same parameter cannot be instantiated multiple times in the same chain.**

#### contract.deployed(signer: KeyringPair, codeHash: Hash | string, inputData: any, endowment: number | BN = new BN('10000000000'), gasRequired: number | BN = new BN('10000000000'))

Similar to instantiate, but will return an instance of [contractApi](#contractApi).

#### contract.load(address: string)

Load the instantiated contract and return an instance of [contractApi](#contractApi)

## contractApi

contractApi can be obtained by `contract.load` and `contract.deployed`, it can call the methods of the contract.

`contractApi.messages.balanceOf(Alice.publicKey).call(<option>)` It calls the balanceOf method of the contract and returns the corresponding type by rpc.

`contractApi.messages.transfer(Bob.publicKey, '100000').send(<option>)` It sends a contract transfer to the chain and get a Result type.

```
interface Result {
 account: string;
  txHash?: string;
  blockHash?: string;
  message?: string;
  data?: any;
  status: 'error' | 'event' | 'queued' | 'success';
  result: SubmittableResult;
  events?: {
    bytes: string;
    section: string;
    method: string;
    phaseType: string;
    phaseIndex: number;
    args: any[];
  }[];
}
```

The events of the contract are decoded.
