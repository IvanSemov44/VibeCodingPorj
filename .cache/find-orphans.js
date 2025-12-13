const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const frontendRoot = path.join(repoRoot, 'frontend');
const exts = ['.tsx', '.ts', '.jsx', '.js'];

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
      files.push(...walk(full));
    } else {
      if (exts.includes(path.extname(entry.name))) files.push(full);
    }
  }
  return files;
}

function normalizeImport(importPath, baseFile) {
  if (!importPath) return null;
  if (importPath.startsWith('.')) {
    // relative
    const baseDir = path.dirname(baseFile);
    const candidate = path.resolve(baseDir, importPath);
    // try to resolve to file with extensions or index files
    for (const ext of exts) {
      const f = candidate + ext;
      if (fs.existsSync(f)) return path.normalize(f);
    }
    for (const ext of exts) {
      const f = path.join(candidate, 'index' + ext);
      if (fs.existsSync(f)) return path.normalize(f);
    }
    return null;
  }
  // ignore absolute or package imports
  return null;
}

function extractImports(code) {
  const imports = [];
  // import ... from 'x'
  const re1 = /import\s+[^'";]+?from\s+['\"]([^'\"]+)['\"]/g;
  // import 'x'
  const re2 = /import\s+['\"]([^'\"]+)['\"]/g;
  // require('x')
  const re3 = /require\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
  // export ... from 'x'
  const re4 = /export\s+[^'";]+?from\s+['\"]([^'\"]+)['\"]/g;
  let m;
  while ((m = re1.exec(code))) imports.push(m[1]);
  while ((m = re2.exec(code))) imports.push(m[1]);
  while ((m = re3.exec(code))) imports.push(m[1]);
  while ((m = re4.exec(code))) imports.push(m[1]);
  return imports;
}

const allFiles = walk(frontendRoot).map(f => path.normalize(f));
const fileIndex = new Set(allFiles);
const outgoing = new Map();
const incomingCount = new Map();
for (const f of allFiles) { outgoing.set(f, new Set()); incomingCount.set(f, 0); }

for (const f of allFiles) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    const imports = extractImports(code);
    for (const imp of imports) {
      const resolved = normalizeImport(imp, f);
      if (resolved && fileIndex.has(resolved)) {
        outgoing.get(f).add(resolved);
        incomingCount.set(resolved, (incomingCount.get(resolved) || 0) + 1);
      }
    }
  } catch (e) {
    // skip
  }
}

// define entry files to ignore as orphans: pages/*, _app, next config, tests, vitest/jest setup, index files used by router
function isEntry(f) {
  const rel = path.relative(frontendRoot, f).replace(/\\/g, '/');
  if (rel.startsWith('pages/')) return true;
  if (rel === 'pages/_app.tsx' || rel === 'pages/_document.tsx') return true;
  if (rel.startsWith('__tests__/') || rel.startsWith('tests/')) return true;
  if (rel.startsWith('jest.config') || rel.startsWith('vitest.config')) return true;
  if (rel.startsWith('tests/') || rel.includes('__tests__')) return true;
  return false;
}

const orphans = [];
for (const f of allFiles) {
  if (incomingCount.get(f) === 0 && !isEntry(f)) {
    orphans.push(path.relative(frontendRoot, f).replace(/\\/g, '/'));
  }
}

console.log('Found', orphans.length, 'orphaned files (no incoming relative imports and not pages/tests):');
orphans.sort().forEach(x => console.log(x));

// write results to frontend/tmp/orphans.txt
const outDir = path.join(frontendRoot, 'tmp');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir, 'orphans.txt'), orphans.join('\n'), 'utf8');
