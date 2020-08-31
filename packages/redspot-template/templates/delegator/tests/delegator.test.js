const rsconfig = require("../redspot-config.js");
const { extrinsicHelper } = require("redspot");
const accumulator = artifacts.require("accumulator");
const adder = artifacts.require("adder");
const delegator = artifacts.require("delegator");
const subber = artifacts.require("subber");

test("contract test", async () => {
  const Alice = config.pairs[0];
  const api = config.api;

  // const contractAddress = await delegator.instantiate(
  //   Alice,
  //   await delegator.putCode(Alice),
  //   delegator.abi.constructors[0](
  //     10000023,
  //     await accumulator.putCode(Alice),
  //     await adder.putCode(Alice),
  //     await subber.putCode(Alice)
  //   )
  // );

  const contractAddress = '5FCGQzdTXTx1WEdJRBeh8wnRyZQyLqH8uLVrntkByB49Gvz6'

  expect("0x" + Buffer.from(Alice.publicKey).toString("hex")).toBe(
    rsconfig.networks.development.accounts[0].publicKey
  );

  const getMessage = async () => {
    const result = await api.rpc.contracts.call({
      dest: contractAddress,
      gasLimit: "100000000000",
      inputData: delegator.abi.messages.get(),
    });

    const decodeData = delegator.abi.createType(delegator.abi.messages.get.type, result.asSuccess.data)
    console.log(decodeData.toString())

    return decodeData
  }

  const changeMessage = async () => {
    const result = await extrinsicHelper(api.tx.contracts.call(
      contractAddress,
      "0",
      "100000000000",
      delegator.abi.messages.change('111123131231'),
    ), Alice);

    console.log(result)
  }

  await getMessage()
  await changeMessage()

});
