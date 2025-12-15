#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

function run(command, args, opts = {}) {
  const res = spawnSync(command, args, Object.assign({ stdio: 'inherit', shell: false }, opts));
  return res.status;
}

console.log('Running backend checks...');

// Try local composer first
try {
  const composerCheck = spawnSync('composer', ['--version'], { stdio: 'ignore', shell: false });
  if (composerCheck.status === 0) {
    console.log('Found local composer, running `composer run check` in backend/');
    process.exit(run('composer', ['run', 'check'], { cwd: path.resolve(__dirname, '..', 'backend') }));
  }
} catch (e) {
  // fall through to docker fallback
}

// Fallback to Docker Compose using php_fpm service
console.log('Local composer not found — falling back to Docker Compose (php_fpm)');
// Use `docker compose run --rm --entrypoint "" php_fpm composer run check` to avoid service entrypoint
const dockerArgs = ['compose', 'run', '--rm', '--entrypoint', '', 'php_fpm', 'composer', 'run', 'check'];
const dockerStatus = run('docker', dockerArgs);
if (dockerStatus !== 0) {
  console.error('\nBackend check failed.');
  console.error('Either install Composer locally (https://getcomposer.org/) or make sure Docker Compose is available and the php_fpm service is defined.');
}
process.exit(dockerStatus);
