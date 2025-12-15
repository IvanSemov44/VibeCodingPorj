#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, cwd, label) {
  return new Promise((resolve) => {
    log(`\n${'='.repeat(60)}`, colors.cyan);
    log(`${label}`, colors.bright + colors.cyan);
    log(`${'='.repeat(60)}\n`, colors.cyan);

    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? command + '.cmd' : command;

    const proc = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        log(`\n✓ ${label} completed successfully\n`, colors.green);
      } else {
        log(`\n✗ ${label} completed with warnings/errors\n`, colors.yellow);
      }
      resolve(code);
    });

    proc.on('error', (err) => {
      log(`\n✗ ${label} failed: ${err.message}\n`, colors.red);
      resolve(1);
    });
  });
}

async function main() {
  log('\n🔍 Finding Unused Code and Files\n', colors.bright + colors.cyan);

  const frontendPath = path.join(__dirname, 'frontend');
  const backendPath = path.join(__dirname, 'backend');

  // Run frontend analysis
  await runCommand(
    'npm',
    ['run', 'find:unused'],
    frontendPath,
    'FRONTEND: Finding unused exports, dependencies, and files'
  );

  // Run backend analysis
  await runCommand(
    'composer',
    ['run', 'find:unused'],
    backendPath,
    'BACKEND: Finding unused code with PHPStan'
  );

  log('\n' + '='.repeat(60), colors.cyan);
  log('Analysis Complete!', colors.bright + colors.green);
  log('='.repeat(60) + '\n', colors.cyan);
  log('Review the output above to identify unused code and files.\n', colors.yellow);
}

main().catch((err) => {
  log(`Error: ${err.message}`, colors.red);
  process.exit(1);
});
