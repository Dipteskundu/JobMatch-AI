const fs = require('fs');
const path = require('path');

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat && stat.isDirectory()) {
      results.push(...walk(fp));
    } else {
      results.push(fp);
    }
  });
  return results;
}

const root = path.join(__dirname, '..', 'src');
const files = walk(root).filter((f) => /\.(js|jsx|ts|tsx)$/.test(f));
let changed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  // Remove Git conflict markers lines
  const lines = content.split(/\r?\n/);
  const filtered = lines.filter((line) => {
    if (/^<{7}/.test(line)) return false;
    if (/^={7}/.test(line)) return false;
    if (/^>{7}/.test(line)) return false;
    return true;
  });
  content = filtered.join('\n');
  if (content !== orig) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('Cleaned', file);
  }
}
console.log('Done. Files changed:', changed);
