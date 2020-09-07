const rsconfig = require('../redspot-config.js');
const erc20 = artifacts.require('erc20');

test('contract test', async () => {
  const Alice = config.pairs[0];
  const Bob = config.pairs[1];

  const erc20Api = await erc20.deployed(
    Alice,
    await erc20.putCode(Alice),
    erc20.abi.constructors[0]('1000000000000000016'),
  );

  expect('0x' + Buffer.from(Alice.publicKey).toString('hex')).toBe(rsconfig.networks.development.accounts[0].publicKey);

  const totalSupply = await erc20Api.messages.totalSupply().call();
  const aliceBalance = await erc20Api.messages.balanceOf(Alice.publicKey).call();
  console.log('beforeAliceBalance:', aliceBalance.toString());
  const transferResult = await erc20Api.messages.transfer(Bob.publicKey, '100000').send({
    from: Alice,
  });
  console.log('events:', transferResult.events);
  const afteraliceBalance = await erc20Api.messages.balanceOf(Alice.publicKey).call();
  console.log(afterAliceBalance);
});
