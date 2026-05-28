import fs from 'fs';

const html = fs.readFileSync(
  'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html',
  'utf8'
);

const marker = "window['bootstrap'] = JSON.parse('";
const start = html.indexOf(marker) + marker.length;
let depth = 0;
let end = start;
let inStr = false;
let esc = false;
for (let i = start; i < html.length; i++) {
  const c = html[i];
  if (inStr) {
    if (esc) esc = false;
    else if (c === '\\') esc = true;
    else if (c === "'") inStr = false;
    continue;
  }
  if (c === "'") {
    inStr = true;
    continue;
  }
  if (c === '(') depth++;
  if (c === ')') {
    depth--;
    if (depth < 0) {
      end = i;
      break;
    }
  }
}
// fallback: find '); after parse
if (end === start) {
  end = html.indexOf("');", start);
}

const raw = html.slice(start, end);
let json;
try {
  json = JSON.parse(raw);
} catch (e) {
  console.error('parse failed', e.message);
  process.exit(1);
}

function walk(o, out = []) {
  if (typeof o === 'string' && o.length >= 2 && /[\p{L}\p{N}]/u.test(o)) {
    if (!/^[a-f0-9]{16,}$/i.test(o) && !o.startsWith('http') && !o.includes('TAEXf')) {
      out.push(o);
    }
  } else if (Array.isArray(o)) o.forEach((x) => walk(x, out));
  else if (o && typeof o === 'object') Object.values(o).forEach((x) => walk(x, out));
  return out;
}

const texts = [...new Set(walk(json))].sort((a, b) => b.length - a.length);
for (const t of texts) {
  if (t.length > 1 && t.length < 500) console.log(JSON.stringify(t));
}
console.error('count', texts.filter((t) => t.length < 500).length);
