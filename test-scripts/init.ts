import { executeNodeScript } from '@redspot/box';
import path from 'path';

executeNodeScript(
  { cwd: path.resolve(__dirname, '../test-project'), args: [] },
  [
    path.resolve(__dirname, '../test-project'),
    'test-project',
    false,
    path.resolve(__dirname, '../'),
    '@redspot/redspot-template',
  ],
  `
var { init } = require('redspot/scripts/init.js');
init.apply(null, JSON.parse(process.argv[1]));
`,
);
