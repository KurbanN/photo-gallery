import fs from 'fs';

const h = fs.readFileSync(
  'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html',
  'utf8'
);
const marker = "window['bootstrap'] = JSON.parse('";
const start = h.indexOf(marker);
const endMarker = "');";
let pos = start + marker.length;
let depth = 0;
let inStr = true;
let esc = false;
for (; pos < h.length; pos++) {
  const c = h[pos];
  if (inStr) {
    if (esc) esc = false;
    else if (c === '\\') esc = true;
    else if (c === "'") inStr = false;
    continue;
  }
}
console.log('start', start, 'end quote at', pos);
console.log(h.slice(pos, pos + 30));
