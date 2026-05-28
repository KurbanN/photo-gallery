import fs from 'fs';

const html = fs.readFileSync(
  'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html',
  'utf8'
);
const marker = "var __bs='";
const start = html.indexOf(marker) + marker.length;
let pos = start;
let esc = false;
for (; pos < html.length; pos++) {
  const c = html[pos];
  if (esc) esc = false;
  else if (c === '\\') esc = true;
  else if (c === "'") break;
}
const bs = html.slice(start, pos);

const idx = bs.indexOf('Nazar');
const chunk = bs.slice(idx, idx + 8);
console.log('chars after Nazar:', [...chunk].map((c) => `${c}(${c.charCodeAt(0)})`).join(' '));

for (const suffix of ['\\n"', '\\\\n"', '\\\\\\n"']) {
  const from = `"A":"Nazar${suffix}`;
  console.log('try', JSON.stringify(from), bs.includes(from));
}
