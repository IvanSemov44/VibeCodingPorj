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
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, cwd, label) {
  return new Promise((resolve) => {
    log(`\n${'='.repeat(70)}`, colors.cyan);
    log(`${label}`, colors.bright + colors.cyan);
    log(`${'='.repeat(70)}\n`, colors.cyan);

    const isWindows = process.platform === 'win32';
    const cmd = isWindows && command === 'npm' ? command + '.cmd' : command;

    const proc = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        log(`\n✓ ${label} - PASSED\n`, colors.green);
        resolve({ success: true, label });
      } else {
        log(`\n✗ ${label} - FAILED\n`, colors.red);
        resolve({ success: false, label });
      }
    });

    proc.on('error', (err) => {
      log(`\n✗ ${label} - ERROR: ${err.message}\n`, colors.red);
      resolve({ success: false, label });
    });
  });
}

async function main() {
  const startTime = Date.now();

  log('\n' + '='.repeat(70), colors.magenta);
  log('🔍 RUNNING QUALITY CHECKS', colors.bright + colors.magenta);
  log('='.repeat(70) + '\n', colors.magenta);

  const frontendPath = path.join(__dirname, 'frontend');
  const backendPath = path.join(__dirname, 'backend');

  const results = [];

  // Frontend checks
  log('\n📦 FRONTEND CHECKS\n', colors.bright + colors.cyan);

  results.push(await runCommand(
    'npm',
    ['run', 'typecheck'],
    frontendPath,
    '1. TypeScript Type Check'
  ));

  results.push(await runCommand(
    'npm',
    ['run', 'format:check'],
    frontendPath,
    '2. Prettier Format Check'
  ));

  results.push(await runCommand(
    'npm',
    ['run', 'lint'],
    frontendPath,
    '3. ESLint'
  ));

  results.push(await runCommand(
    'npm',
    ['run', 'test:ci'],
    frontendPath,
    '4. Tests (Vitest)'
  ));

  // Backend checks
  log('\n⚙️  BACKEND CHECKS\n', colors.bright + colors.cyan);

  results.push(await runCommand(
    'composer',
    ['run', 'lint:test'],
    backendPath,
    '5. Laravel Pint (Code Style)'
  ));

  results.push(await runCommand(
    'composer',
    ['run', 'analyse'],
    backendPath,
    '6. PHPStan (Static Analysis)'
  ));

  results.push(await runCommand(
    'composer',
    ['run', 'test'],
    backendPath,
    '7. Tests (Pest/PHPUnit)'
  ));

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  log('\n' + '='.repeat(70), colors.magenta);
  log('📊 QUALITY CHECK SUMMARY', colors.bright + colors.magenta);
  log('='.repeat(70) + '\n', colors.magenta);

  results.forEach(result => {
    const status = result.success ? '✓' : '✗';
    const color = result.success ? colors.green : colors.red;
    log(`${status} ${result.label}`, color);
  });

  log(`\nTotal: ${results.length} checks`, colors.bright);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, colors.red);
  log(`Duration: ${duration}s\n`, colors.yellow);

  if (failed > 0) {
    log('❌ Quality checks FAILED. Please fix the issues above.\n', colors.red);
    process.exit(1);
  } else {
    log('✅ All quality checks PASSED!\n', colors.green);
    process.exit(0);
  }
}

main().catch((err) => {
  log(`Error: ${err.message}`, colors.red);
  process.exit(1);
});
