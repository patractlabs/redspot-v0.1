import { init } from './createApp';

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

if (+major < 10) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Redspot requires Node 10 or higher. \n' +
      'Please update your version of Node.',
  );
  process.exit(1);
}

init();
