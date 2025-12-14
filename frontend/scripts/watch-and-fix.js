#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const IGNORED = ['.git', 'node_modules', '.next', 'dist', 'coverage', '.husky'];
const WATCH_EXT = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.md'];
const DEBOUNCE_MS = 700;

let timeout = null;
let running = false;

function log(...args) {
  console.log('[watch-and-fix]', ...args);
}

function shouldIgnore(filename) {
  return IGNORED.some((seg) => filename.includes(seg));
}

function hasWatchedExt(filename) {
  return WATCH_EXT.includes(path.extname(filename));
}

function runCommands() {
  if (running) return;
  running = true;
  log('Changes detected — running typecheck, lint (fix), and prettier...');

  const cmds = [
    'npm run typecheck',
    'npm run lint:fix',
    'npm run format'
  ];

  const runSequential = (list) => {
    if (list.length === 0) {
      running = false;
      log('All tasks finished.');
      return;
    }
    const cmd = list.shift();
    log('> ', cmd);
    const p = exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (err) {
        log(`Command failed: ${cmd}`);
        running = false;
        return;
      }
      runSequential(list);
    });
  };

  runSequential(cmds.slice());
}

function scheduleRun() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    runCommands();
  }, DEBOUNCE_MS);
}

function startWatching(dir) {
  try {
    const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      const filePath = path.join(dir, filename);
      if (shouldIgnore(filePath)) return;
      if (!hasWatchedExt(filePath)) return;
      scheduleRun();
    });

    watcher.on('error', (err) => {
      log('Watcher error:', err.message || err);
    });

    log('Watching for changes in', dir);
  } catch (err) {
    log('Failed to start watcher:', err.message || err);
  }
}

const cwd = process.cwd();
startWatching(cwd);
