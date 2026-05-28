import fs from 'fs';
import path from 'path';

const OUT = 'd:/Project/photo-gallery/public/invite-assets/maket12-shell';
const BASE = 'https://bomainvite.com/maket12';

const html = await fetch(`${BASE}/`).then((r) => r.text());
fs.mkdirSync(OUT, { recursive: true });

const assetPaths = new Set();
for (const m of html.matchAll(/_assets\/[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*/g)) {
  assetPaths.add(m[0].replace(/\\\//g, '/'));
}

console.log('Found', assetPaths.size, 'asset paths');

let ok = 0;
let fail = 0;
for (const rel of assetPaths) {
  const url = `${BASE}/${rel}`;
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try {
    const res = await fetch(url);
    if (!res.ok) {
      fail++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    ok++;
  } catch {
    fail++;
  }
}

// Save index with fixed base
let index = html.replace(/<base href="[^"]*">/, '<base href="/invite-assets/maket12-shell/">');
index = index.replace(/\\u002F/g, '/');
fs.writeFileSync(path.join(OUT, 'index.html'), index);

console.log('Downloaded', ok, 'failed', fail);
console.log('index.html written');
console.log('Run: node scripts/fetch-maket12-all-chunks.mjs && node scripts/patch-maket12-index.mjs');
