const flipper = artifacts.require("flipper");

module.exports = async (config) => {
  const Alice = config.pairs[0];

  return flipper.instantiate(
    Alice,
    await flipper.putCode(Alice),
    flipper.abi.constructors[0](true)
  );
};
