const rsconfig = require("../redspot-config.js");
const { extrinsicHelper } = require("redspot");
const erc20 = artifacts.require("erc20");

test("contract test", async () => {
  const Alice = config.pairs[0];
  const Bob = config.pairs[1];

  const api = config.api;

  const contractAddress = await erc20.instantiate(
    Alice,
    await erc20.putCode(Alice),
    erc20.abi.constructors[0]("1000000000000000016")
  );



  expect("0x" + Buffer.from(Alice.publicKey).toString("hex")).toBe(
    rsconfig.networks.development.accounts[0].publicKey
  );

  const totalSupply = async () => {
    const result = await api.rpc.contracts.call({
      dest: contractAddress,
      gasLimit: "100000000000",
      inputData: erc20.abi.messages.totalSupply(),
    });

    const decodeData = erc20.abi.createType(
      erc20.abi.messages.totalSupply.type,
      result.asSuccess.data
    );
    console.log("totalSupply:", decodeData.toString());

    return decodeData;
  };

  const balanceOf = async (accountId) => {
    const result = await api.rpc.contracts.call({
      dest: contractAddress,
      gasLimit: "100000000000",
      inputData: erc20.abi.messages.balanceOf(accountId.publicKey),
    });

    const decodeData = erc20.abi.createType(
      erc20.abi.messages.balanceOf.type,
      result.asSuccess.data
    );
    console.log("balanceOf:", accountId.address, decodeData.toString());

    return decodeData;
  };

  const transfer = async (accountId, balance) => {
    const result = await extrinsicHelper(
      api.tx.contracts.call(
        contractAddress,
        "100000000",
        "100000000000",
        erc20.abi.messages.transfer(accountId.publicKey, balance)
      ),
      Alice
    );

    console.log(result)

    console.log(`transfer to ${accountId.address} ${balance}`);
  };

  const approve = async (accountId, balance) => {
    const result = await extrinsicHelper(
      api.tx.contracts.call(
        contractAddress,
        "100000000",
        "100000000000",
        erc20.abi.messages.approve(accountId.publicKey, balance)
      ),
      Alice
    );

    console.log(result)

    console.log(`transfer to ${accountId.address} ${balance}`);
  };

  await totalSupply();
  await balanceOf(Alice);
  await approve(Bob, "1000000021903120321830");
  await transfer(Bob, "100000");
  await balanceOf(Bob);

});
