import fs from 'fs';

const html = fs.readFileSync(
  'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html',
  'utf8'
);
const start = html.indexOf("window['bootstrap'] = JSON.parse('") + "window['bootstrap'] = JSON.parse('".length;
const end = html.indexOf("');", start);
const raw = html.slice(start, end);
const json = JSON.parse(raw.replace(/\\'/g, "'"));

function walk(o, out = []) {
  if (typeof o === 'string' && o.length > 1 && /[\p{L}]/u.test(o)) out.push(o);
  else if (Array.isArray(o)) o.forEach((x) => walk(x, out));
  else if (o && typeof o === 'object') Object.values(o).forEach((x) => walk(x, out));
  return out;
}

const texts = [...new Set(walk(json))].filter((t) => t.length < 800 && !t.startsWith('http'));
for (const t of texts.sort((a, b) => b.length - a.length).slice(0, 60)) {
  console.log('---');
  console.log(t);
}
console.log('\nTotal strings:', texts.length);
