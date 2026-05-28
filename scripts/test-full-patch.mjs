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
let bs = html.slice(start, pos);

function escapeCanvaFragment(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n');
}

function replaceCanvaInBootstrap(bootstrapStr, oldText, newText) {
  if (!oldText || oldText === newText) return bootstrapStr;
  const from = '"A":"' + escapeCanvaFragment(oldText) + '\\\\n"';
  const to = '"A":"' + escapeCanvaFragment(newText) + '\\\\n"';
  return bootstrapStr.includes(from) ? bootstrapStr.split(from).join(to) : bootstrapStr;
}

const patches = [
  { from: 'Nazar', to: 'Kurban' },
  { from: 'Anita', to: 'Fatima' },
  { from: '02.08', to: '30.05' },
  { from: '2026', to: '2026' },
];
for (const p of patches.sort((a, b) => b.from.length - a.from.length)) {
  bs = replaceCanvaInBootstrap(bs, p.from, p.to);
}
console.log('Kurban', bs.includes('Kurban'));
console.log('Nazar', bs.includes('"A":"Nazar\\\\n"') || bs.includes('Nazar'));
console.log('Fatima', bs.includes('Fatima'));
