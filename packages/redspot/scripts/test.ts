import * as jest from 'jest';

process.on('unhandledRejection', (err) => {
  throw err;
});
const argv = process.argv.slice(2);

jest.run(argv);
