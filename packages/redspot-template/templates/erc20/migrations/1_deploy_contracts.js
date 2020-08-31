const erc20 = artifacts.require("erc20");

module.exports = async (config) => {
  const alice = config.pairs[0];

  return erc20.instantiate(
    alice,
    await erc20.putCode(alice),
    erc20.abi.constructors[0]("1000000000000000000")
  );
};
