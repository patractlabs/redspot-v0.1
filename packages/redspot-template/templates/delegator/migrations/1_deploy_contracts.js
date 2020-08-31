const accumulator = artifacts.require('accumulator');
const adder = artifacts.require('adder');
const delegator = artifacts.require('delegator');
const subber = artifacts.require('subber');

module.exports = async (config) => {
  const alice = config.pairs[2];
  const adderCodeHash = await adder.putCode(alice);
  const accumulatorCodeHash = await accumulator.putCode(alice);
  const subberCodeHash = await subber.putCode(alice);
  const delegatorCodeHash = await delegator.putCode(alice);

  return delegator.instantiate(
    alice,
    delegatorCodeHash,
    delegator.abi.constructors[0](10000000, accumulatorCodeHash, adderCodeHash, subberCodeHash),
  );
};
