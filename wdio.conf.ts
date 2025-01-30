import os from 'os';
import path from 'path';
import { ChildProcessByStdio, spawn, spawnSync } from 'child_process';
import { Writable } from 'stream';

let tauriDriver: ChildProcessByStdio<Writable, null, null>;

const config = {
  specs: ['./tests/e2e/specs/**/*.ts'],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      'tauri:options': {
        application: '../../target/release/hello-tauri-webdriver',
      },
      browserName: 'chrome'
    },
  ],
  reporters: ['spec'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  baseUrl: 'http://localhost:3000',
  onPrepare: () => spawnSync('cargo', ['build', '--release']),
  beforeSession: () =>
    (tauriDriver = spawn(
      path.resolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
      [],
      { stdio: [null, process.stdout, process.stderr] }
    )),
  afterSession: () => tauriDriver.kill(),
};

export { config };
