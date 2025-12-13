const fs = require('fs');
const path = require('path');
const repoRoot = path.resolve(__dirname, '..');
const frontendRoot = path.join(repoRoot, 'frontend');
const exts = ['.tsx', '.ts', '.jsx', '.js'];
const patterns = [
  'TwoFactorSetup',
  'useFileUpload',
  'useFilters',
  'jest.setup',
  'lib/constants',
  'lib/styles',
  'next-env.d.ts',
  'next.config',
  'store/hooks',
  'tailwind.config',
  'types.d.ts',
  'css-modules',
  'qrcode.d.ts'
];

function walk(dir) {
  let results = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === '.next' || name === '.git') continue;
      results = results.concat(walk(full));
    } else {
      if (exts.includes(path.extname(name))) results.push(full);
    }
  }
  return results;
}

const files = walk(frontendRoot);
const out = {};
for (const p of patterns) out[p] = [];
for (const f of files) {
  let code = '';
  try { code = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
  for (const p of patterns) {
    if (code.indexOf(p) !== -1) {
      out[p].push(path.relative(frontendRoot, f).replace(/\\/g, '/'));
    }
  }
}
for (const p of patterns) {
  console.log('===', p, '===');
  if (out[p].length) {
    out[p].forEach(x => console.log(x));
  } else {
    console.log('No matches');
  }
}
