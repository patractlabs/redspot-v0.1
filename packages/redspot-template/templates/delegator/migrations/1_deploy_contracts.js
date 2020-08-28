const accumulator = artifacts.require("accumulator");
const adder = artifacts.require("adder");
const delegator = artifacts.require("delegator");
const subber = artifacts.require("subber");

module.exports = async (config, deployer) => {
  const alice = config.pairs[0];
  const adderCodeHash = await deployer.putCode(adder, alice);
  const accumulatorCodeHash = await deployer.putCode(accumulator, alice);
  const subberCodeHash = await deployer.putCode(subber, alice);
  const delegatorCodeHash = await deployer.putCode(delegator, alice);
  console.log(
    adderCodeHash,
    accumulatorCodeHash,
    subberCodeHash,
    delegatorCodeHash
  );
};
