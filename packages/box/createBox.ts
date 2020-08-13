import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import spawn from 'cross-spawn';
import os from 'os';
import semver from 'semver';
import { execSync } from 'child_process';

const packageToInstall = 'redspot';
const templateToInstall = '@redspot/redspot-template';

function createBox(name: string, verbose: boolean): void {
  const root = path.resolve(name);
  const appName = path.basename(root);

  checkDirName(appName);

  fs.ensureDirSync(name);

  if (!isSafeToCreateBox(root, name)) {
    process.exit(1);
  }

  console.log();
  console.log(`Creating a new Project in ${chalk.green(root)}.`);
  console.log(`================`);

  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };

  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);

  const originalDirectory = process.cwd();

  const useYarn = shouldUseYarn();

  run(root, appName, originalDirectory, useYarn, verbose);
}

function run(root: string, appName: string, originalDirectory: string, useYarn: boolean, verbose: boolean) {
  const allDependencies = [packageToInstall];

  console.log('Installing packages. This might take a couple of minutes.');

  install(root, allDependencies, useYarn, verbose).then(async () => {
    checkNodeVersion(packageToInstall);

    await executeNodeScript(
      {
        cwd: process.cwd(),
        args: [],
      },
      [root, appName, verbose, originalDirectory, templateToInstall],
      `
    var init = require('${packageToInstall}/scripts/init.js');
    init.apply(null, JSON.parse(process.argv[1]));
  `,
    );
  });
}

function install(root: string, dependencies: string[], useYarn: boolean, verbose: boolean) {
  return new Promise((resolve, reject) => {
    let command: string;
    let args: string[];

    if (useYarn) {
      command = 'yarnpkg';
      args = ['add', '--exact'];

      [].push.apply(args, dependencies as any);

      args.push('--cwd');
      args.push(root);
    } else {
      command = 'npm';
      args = ['install', '--save', '--save-exact', '--loglevel', 'error'].concat(dependencies);
    }

    if (verbose) {
      args.push('--verbose');
    }

    const child = spawn(command, args, { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function checkDirName(dirname: string): void {}

function checkNodeVersion(packageName: string) {
  const packageJsonPath = path.resolve(process.cwd(), 'node_modules', packageName, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = require(packageJsonPath);
  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }

  if (!semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(
      chalk.red(
        'You are running Node %s.\n' + 'Redspot requires Node %s or higher. \n' + 'Please update your version of Node.',
      ),
      process.version,
      packageJson.engines.node,
    );
    process.exit(1);
  }
}

function isSafeToCreateBox(root: string, name: string): boolean {
  const files = fs.readdirSync(root);

  if (files.length > 0) {
    console.log(`The directory ${chalk.green(name)} is not an empty directory.`);
    console.log();
    console.log(`Try using a new directory name.`);

    return false;
  }

  return true;
}

function executeNodeScript({ cwd, args }: { cwd: string; args: string[] }, data: any[], source: string) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [...args, '-e', source, '--', JSON.stringify(data)], {
      cwd,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: `node ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

export default createBox;
