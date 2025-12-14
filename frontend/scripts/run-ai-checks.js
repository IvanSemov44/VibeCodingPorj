#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function readConfig(dir) {
  const cfgPath = process.env.AI_ACTION_CONFIG || path.join(dir, 'ai-action.config.json');
  if (!fs.existsSync(cfgPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse ai-action.config.json:', e.message);
    return null;
  }
}

function runCmd(cmd) {
  return new Promise((resolve) => {
    const p = exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ cmd, code: err ? err.code || 1 : 0, stdout: stdout || '', stderr: stderr || '' });
    });
    p.stdout && p.stdout.pipe(process.stdout);
    p.stderr && p.stderr.pipe(process.stderr);
  });
}

async function main() {
  const cwd = process.cwd();
  const cfg = readConfig(cwd);
  if (!cfg) {
    console.error('No ai-action.config.json found.');
    process.exit(2);
  }

  const results = [];
  for (const cmd of cfg.commands || []) {
    console.log('Running:', cmd);
    // run in package dir (cwd)
    const res = await runCmd(cmd);
    results.push(res);
    if (res.code !== 0) {
      console.error(`Command failed: ${cmd}`);
      // If the command is a typecheck, fail fast
      if (cmd.toLowerCase().includes('tsc') || cmd.toLowerCase().includes('typecheck')) {
        console.log('Aborting further commands due to typecheck failure.');
        break;
      }
    }
  }

  // detect file changes
  let changed = false;
  try {
    const { execSync } = require('child_process');
    const out = execSync('git status --porcelain', { encoding: 'utf8' });
    changed = out && out.trim().length > 0;
  } catch (e) {
    // no git or git failed
  }

  if (changed) {
    console.log('Auto-fixes produced file changes.');
    if (cfg.amendOnFix && process.argv.includes('--amend')) {
      try {
        const { execSync } = require('child_process');
        execSync('git add -A', { stdio: 'inherit' });
        execSync('git commit --amend --no-edit --reset-author', { stdio: 'inherit' });
        console.log('Amended last commit with auto-fixes.');
      } catch (e) {
        console.error('Failed to amend commit:', e.message);
      }
    }
  }

  // print machine-readable summary
  const summary = { results, changed };
  console.log('\n=== AI-CHECKS-SUMMARY-BEGIN ===');
  console.log(JSON.stringify(summary, null, 2));
  console.log('=== AI-CHECKS-SUMMARY-END ===\n');

  // exit with non-zero if any command failed with non-zero
  const failed = results.some(
    (r) =>
      r.code !== 0 &&
      (r.cmd.toLowerCase().includes('typecheck') || r.cmd.toLowerCase().includes('tsc')),
  );
  process.exit(failed ? 3 : 0);
}

main();
