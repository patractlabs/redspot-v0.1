const rsconfig = require("../redspot-config.js");
const flipper = artifacts.require("flipper");

test("contract test", async () => {
  const Alice = config.pairs[0];

  const flipperApi = await flipper.deployed(
    Alice,
    await flipper.putCode(Alice),
    flipper.abi.constructors[0](false)
  );

  expect("0x" + Buffer.from(Alice.publicKey).toString("hex")).toBe(
    rsconfig.networks.development.accounts[0].publicKey
  );

  const value = await flipperApi.messages.get().call();
  console.log("value:", value);

  const txResult = await flipperApi.messages.flip().send({
    from: Alice,
  });
  console.log("txResult:", txResult);
});
