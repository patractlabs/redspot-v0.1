const rsconfig = require('../redspot-config.js');
const flipper = artifacts.require('flipper');

describe('flipper test', () => {
  let Alice;
  let flipperApi;

  beforeAll(async () => {
    Alice = config.pairs[0];
    flipperApi = await flipper.deployed(Alice, await flipper.putCode(Alice), flipper.abi.constructors[0](false));
  });

  test('account', () => {
    expect('0x' + Buffer.from(Alice.publicKey).toString('hex')).toBe(
      rsconfig.networks.development.accounts[0].publicKey,
    );
  });

  test('flipper', async () => {
    const beforeValue = await flipperApi.messages.get().call();
    console.log('Current value is', beforeValue.toString());
    console.log('Flip');
    const txResult = await flipperApi.messages.flip().send({
      from: Alice,
    });
    expect(txResult.status).toEqual('success');
    const afterValue = await flipperApi.messages.get().call();
    console.log('Current value is', afterValue.toString());
    expect(afterValue.toJSON()).toEqual(!beforeValue.toJSON());
  });
});
