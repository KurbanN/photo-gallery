import fs from 'fs';
import path from 'path';

const OUT = 'd:/Project/photo-gallery/public/invite-assets/maket12-shell';
const ASSETS_DIR = path.join(OUT, '_assets');

const ASSET_PATTERNS = [
  /_assets\/([a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*)/g,
  /["']([a-f0-9]{16}\.js)["']/g,
  /["']([a-f0-9]{16}\.strings\.js)["']/g,
  /["']([a-f0-9]{16}\.[a-z0-9]+\.vendor\.js)["']/g,
  /["']([a-f0-9]{16}\.vendor\.js)["']/g,
  /["']([a-f0-9]{16}\.ru-RU\.js)["']/g,
  /["']([a-f0-9]{16}\.ltr\.css)["']/g,
  /["'](static_font_\d+\.ltr\.css)["']/g,
];

function collectRefsFromText(text) {
  const refs = new Set();
  for (const re of ASSET_PATTERNS) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      const p = m[1].replace(/\\\//g, '/');
      refs.add(p.startsWith('_assets/') ? p : `_assets/${p}`);
    }
  }
  return refs;
}

function collectRefsFromFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return collectRefsFromText(text);
}

const refs = new Set();
for (const file of [path.join(OUT, 'index.html')]) {
  for (const r of collectRefsFromFile(file)) refs.add(r);
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/\.(js|css|html)$/i.test(ent.name)) {
      for (const r of collectRefsFromFile(full)) refs.add(r);
    }
  }
}
walk(ASSETS_DIR);

const missing = [...refs].filter((r) => !fs.existsSync(path.join(OUT, r)));
console.log('Total refs:', refs.size);
console.log('Missing:', missing.length);
missing.forEach((m) => console.log(m));
