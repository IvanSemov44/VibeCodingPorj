const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'coverage', '.tmp');
if (!fs.existsSync(dir)) {
  console.error('coverage .tmp directory not found:', dir);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((f) => f.startsWith('coverage-') && f.endsWith('.json'));
const fileData = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

const merged = new Map();

for (const item of fileData) {
  if (!item.result) continue;
  for (const script of item.result) {
    const url = script.url.replace('file:///', '').replace(/\\/g, '/');
    const key = url;
    if (!merged.has(key)) merged.set(key, []);
    merged.get(key).push(script);
  }
}

function analyzeScript(entries) {
  // entries: array of script coverage objects from workers
  // we'll merge by function ranges: consider a range covered if any worker reports count>0
  let totalRanges = 0;
  let coveredRanges = 0;
  for (const s of entries) {
    if (!s.functions) continue;
    for (const fn of s.functions) {
      if (!fn.ranges) continue;
      for (const r of fn.ranges) {
        totalRanges += 1;
        if (r.count && r.count > 0) coveredRanges += 1;
      }
    }
    // only use first entry for totals (they are duplicated across workers), so break
    break;
  }
  // However above counts only from first entry; to approximate merged coverage,
  // recompute by aggregating ranges across entries by startOffset/endOffset.
  const rangeMap = new Map();
  for (const s of entries) {
    if (!s.functions) continue;
    for (const fn of s.functions) {
      if (!fn.ranges) continue;
      for (const r of fn.ranges) {
        const k = `${r.startOffset}-${r.endOffset}`;
        const prev = rangeMap.get(k) || 0;
        rangeMap.set(k, Math.max(prev, r.count || 0));
      }
    }
  }
  const aggTotal = rangeMap.size;
  const aggCovered = Array.from(rangeMap.values()).filter((c) => c > 0).length;
  return { total: aggTotal, covered: aggCovered };
}

let grandTotal = 0;
let grandCovered = 0;
const perFile = [];

for (const [file, entries] of merged.entries()) {
  const { total, covered } = analyzeScript(entries);
  if (total === 0) continue;
  grandTotal += total;
  grandCovered += covered;
  perFile.push({ file, total, covered, pct: ((covered / total) * 100).toFixed(1) });
}

perFile.sort((a, b) => b.pct - a.pct);

console.log('Coverage summary (approximate, based on V8 function-range hits):');
console.log(`Files analyzed: ${perFile.length}`);
console.log('Top 20 files by % covered:');
perFile.slice(0, 20).forEach((f) => console.log(`${f.pct}% — ${f.file} (${f.covered}/${f.total})`));
console.log('...');
console.log(
  `Overall approx coverage: ${((grandCovered / grandTotal) * 100).toFixed(
    1,
  )}% (${grandCovered}/${grandTotal})`,
);

process.exit(0);
