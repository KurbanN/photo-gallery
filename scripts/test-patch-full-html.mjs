import fs from 'fs';

function escapeCanvaFragment(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n');
}

function replaceCanvaInBootstrap(s, oldText, newText) {
  const from = '"A":"' + escapeCanvaFragment(oldText) + '\\\\n"';
  const to = '"A":"' + escapeCanvaFragment(newText) + '\\\\n"';
  return s.includes(from) ? s.split(from).join(to) : s;
}

const html = fs.readFileSync(
  'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html',
  'utf8'
);
const out = replaceCanvaInBootstrap(html, 'Nazar', 'SUIIIIIIIIIIII');
console.log('changed', out !== html);
console.log('has SUIII', out.includes('SUIIIIIIIIIIII'));
console.log('has Nazar in pattern', out.includes('"A":"Nazar\\\\n"'));
