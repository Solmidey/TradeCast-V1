const fs = require('fs');
const path = require('path');

const key = process.argv[2];
const value = process.argv[3];
if (!key || !value) {
  console.error('Usage: node scripts/set-env.js KEY VALUE');
  process.exit(1);
}
const envPath = path.join(process.cwd(), '.env.local');
let lines = [];
if (fs.existsSync(envPath)) {
  lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  lines = lines.filter(Boolean).filter(l => !l.startsWith(`${key}=`));
}
lines.push(`${key}=${value}`);
fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');
console.log(`Saved ${key} to .env.local`);
