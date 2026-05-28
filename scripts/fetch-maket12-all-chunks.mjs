import fs from 'fs';
import path from 'path';

const OUT = 'd:/Project/photo-gallery/public/invite-assets/maket12-shell';
const ASSETS_DIR = path.join(OUT, '_assets');
const BASE = 'https://bomainvite.com/maket12';

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
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length > 20_000_000) return new Set();
    const text = buf.toString('utf8');
    if (text.includes('\ufffd') && /[\x00-\x08]/.test(text.slice(0, 200))) {
      return new Set();
    }
    return collectRefsFromText(text);
  } catch {
    return new Set();
  }
}

function walkLocalAssets() {
  const refs = new Set();
  const queue = [path.join(OUT, 'index.html')];

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walkDir(full);
      else queue.push(full);
    }
  }

  walkDir(ASSETS_DIR);

  for (const file of queue) {
    for (const r of collectRefsFromFile(file)) refs.add(r);
  }
  return refs;
}

async function download(rel) {
  const url = `${BASE}/${rel}`;
  const dest = path.join(OUT, rel);
  if (fs.existsSync(dest)) return 'skip';
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) return `fail ${res.status}`;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 32) return 'fail tiny';
  fs.writeFileSync(dest, buf);
  return 'ok';
}

let round = 0;
let totalOk = 0;
let totalFail = 0;

while (round < 30) {
  round++;
  const refs = walkLocalAssets();
  const missing = [...refs].filter((r) => !fs.existsSync(path.join(OUT, r)));
  if (missing.length === 0) {
    console.log(`Round ${round}: all ${refs.size} refs present`);
    break;
  }
  console.log(`Round ${round}: downloading ${missing.length} missing (${refs.size} total refs)`);
  let ok = 0;
  let fail = 0;
  for (const rel of missing) {
    const result = await download(rel);
    if (result === 'ok') ok++;
    else if (result?.startsWith('fail')) fail++;
  }
  totalOk += ok;
  totalFail += fail;
  console.log(`  ok=${ok} fail=${fail}`);
  if (ok === 0) break;
}

const files = fs.existsSync(ASSETS_DIR)
  ? fs.readdirSync(ASSETS_DIR, { recursive: true }).filter((f) => String(f).endsWith('.js')).length
  : 0;
console.log(`Done. Downloaded this run: ${totalOk}, failed: ${totalFail}, js files under _assets: ~${files}`);
