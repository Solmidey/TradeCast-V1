const fs = require('fs');
const path = require('path');

function findAbiFile(startDirs) {
  const candidates = [];
  const seen = new Set();
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (seen.has(p)) continue; seen.add(p);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) walk(p);
      else if (name.toLowerCase() === 'tradereceipt.json') candidates.push(p);
    }
  }
  startDirs.forEach(walk);
  // Prefer exact TradeReceipt.json if found
  if (candidates.length) return candidates[0];
  // Fallback: first json file that contains an "abi" array with at least one function named like *receipt*
  function fallback(dir) {
    if (!fs.existsSync(dir)) return null;
    const stack = [dir];
    while (stack.length) {
      const d = stack.pop();
      for (const n of fs.readdirSync(d)) {
        const p = path.join(d, n);
        const st = fs.statSync(p);
        if (st.isDirectory()) stack.push(p);
        else if (p.endsWith('.json')) {
          try {
            const j = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (Array.isArray(j.abi) && j.abi.some(x => x && x.type === 'function')) {
              return p;
            }
          } catch {}
        }
      }
    }
    return null;
  }
  return fallback('out') || fallback('artifacts') || null;
}

const file = findAbiFile(['out', 'artifacts']);
if (!file) {
  console.error('❌ Could not find TradeReceipt ABI. Looked under ./out and ./artifacts.');
  console.error('   If you compiled elsewhere, copy the ABI array into lib/abi/TradeReceipt.json manually.');
  process.exit(1);
}
const j = JSON.parse(fs.readFileSync(file,'utf8'));
const abi = Array.isArray(j.abi) ? j.abi : j; // support raw abi
fs.writeFileSync('lib/abi/TradeReceipt.json', JSON.stringify(abi, null, 2));
console.log('✅ ABI saved to lib/abi/TradeReceipt.json from', file);
