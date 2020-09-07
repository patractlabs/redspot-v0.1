module.exports = {
  outDir: './artifacts',
  networks: {
    development: {
      types: {
        // Address: "AccountId",
        // LookupSource: "AccountId",
      },
      prefix: 42,
      endpoints: ['ws://127.0.0.1:9944'],
      accounts: [
        {
          name: 'alice',
          publicKey: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
          secretKey:
            '0x98319d4ff8a9508c4bb0cf0b5a78d760a0b2082c02775e6e82370816fedfff48925a225d97aa00682d6a59b95b18780c10d7032336e88f3442b42361f4a66011',
        },
        {
          name: 'bob',
          publicKey: '0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48',
          secretKey:
            '0x081ff694633e255136bdb456c20a5fc8fed21f8b964c11bb17ff534ce80ebd5941ae88f85d0c1bfc37be41c904e1dfc01de8c8067b0d6d5df25dd1ac0894a325',
        },
        {
          name: 'Charlie',
          publicKey: '0x90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22',
          secretKey:
            '0xa8f2d83016052e5d6d77b2f6fd5d59418922a09024cda701b3c34369ec43a7668faf12ff39cd4e5d92bb773972f41a7a5279ebc2ed92264bed8f47d344f8f18c',
        },
      ],
    },
  },
};
