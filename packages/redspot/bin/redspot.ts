#!/usr/bin/env node

import spawn from 'cross-spawn';

process.on('unhandledRejection', (err) => {
  throw err;
});

const scripts = ['build', 'migrate'];
const args = process.argv.slice(2);
const scriptIndex = args.findIndex((x) => scripts.includes(x));
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (scripts.includes(script)) {
  const result = spawn.sync(
    process.execPath,
    nodeArgs.concat(require.resolve('../scripts/' + script)).concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' },
  );
  if (result.signal) {
    process.exit(1);
  }

  process.exit(result.status || undefined);
} else {
  console.log('Unknown script "' + script + '".');
}
