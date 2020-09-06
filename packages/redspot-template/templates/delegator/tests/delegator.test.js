const rsconfig = require("../redspot-config.js");
const accumulator = artifacts.require("accumulator");
const adder = artifacts.require("adder");
const delegator = artifacts.require("delegator");
const subber = artifacts.require("subber");

test("contract test", async () => {
  const Alice = config.pairs[0];

  const delegatorApi = await delegator.deployed(
    Alice,
    await delegator.putCode(Alice),
    delegator.abi.constructors[0](
      10000023,
      await accumulator.putCode(Alice),
      await adder.putCode(Alice),
      await subber.putCode(Alice)
    )
  );

  expect("0x" + Buffer.from(Alice.publicKey).toString("hex")).toBe(
    rsconfig.networks.development.accounts[0].publicKey
  );

  const value = await delegatorApi.messages.get().call();
  console.log("value:", value);

  const txResult = await delegatorApi.messages.change("1000024").send({
    from: Alice,
  });
  console.log("txResult:", txResult);
});
