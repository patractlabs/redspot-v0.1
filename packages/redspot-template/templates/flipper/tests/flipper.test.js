const rsconfig = require("../redspot-config.js");
const { extrinsicHelper } = require("redspot");
const flipper = artifacts.require("flipper");

test("contract test", async () => {
  const Alice = config.pairs[0];

  const api = config.api;

  const contractAddress = await flipper.instantiate(
    Alice,
    await flipper.putCode(Alice),
    flipper.abi.constructors[0](false)
  );

  expect("0x" + Buffer.from(Alice.publicKey).toString("hex")).toBe(
    rsconfig.networks.development.accounts[0].publicKey
  );

  const get = async () => {
    const result = await api.rpc.contracts.call({
      dest: contractAddress,
      gasLimit: "100000000000",
      inputData: flipper.abi.messages.get(),
    });

    const decodeData = flipper.abi.createType(
      flipper.abi.messages.get.type,
      result.asSuccess.data
    );
    console.log("current:", decodeData.toString());

    return decodeData.toJSON();
  };

  const flip = async () => {
    const result = await extrinsicHelper(
      api.tx.contracts.call(
        contractAddress,
        "0",
        "100000000000",
        flipper.abi.messages.flip()
      ),
      Alice
    );
    console.log(`flip`);
  };

  const expectResult = !(await get());
  await flip();
  expect(await get()).toEqual(expectResult);
});
