const rsconfig = require("../redspot-config.js");

test("is Alice", () => {
  const Alice = config.pairs[0];
  expect("0x" + Buffer.from(Alice.publicKey).toString("hex")).toBe(
    rsconfig.networks.development.accounts[0].publicKey
  );
});
