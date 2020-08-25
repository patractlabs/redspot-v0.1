module.exports = {
  outDir: './artifacts',
  networks: {
    development: {
      endpoints: ['ws://127.0.0.1:9944'],
      accounts: [
        { name: 'alice', seed: 'Alice' },
        { name: 'bob', seed: 'Bob' },
        { name: 'charlie', seed: 'Charlie' },
        { name: 'dave', seed: 'Dave' },
        { name: 'eve', seed: 'Eve' },
        { name: 'ferdie', seed: 'Ferdie' },
        { name: 'alice_stash', seed: 'Alice//stash' },
        { name: 'bob_stash', seed: 'Bob//stash' },
        { name: 'charlie_stash', seed: 'Charlie//stash' },
        { name: 'dave_stash', seed: 'Dave//stash' },
        { name: 'eve_stash', seed: 'Eve//stash' },
        { name: 'ferdie_stash', seed: 'Ferdie//stash' },
      ],
    },
  },
};
