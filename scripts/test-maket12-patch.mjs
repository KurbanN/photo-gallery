import fs from 'fs';

const html = fs.readFileSync(
  'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html',
  'utf8'
);

function escapeCanvaFragment(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n');
}

function replaceCanvaText(html, oldText, newText) {
  const from = `"A":"${escapeCanvaFragment(oldText)}\\\\n"`;
  const to = `"A":"${escapeCanvaFragment(newText)}\\\\n"`;
  return html.includes(from) ? html.split(from).join(to) : html;
}

let out = replaceCanvaText(html, 'Nazar', 'Ivan');
out = replaceCanvaText(out, 'Anita', 'Maria');
console.log('Ivan', out.includes('Ivan'));
console.log('Nazar absent', !out.includes('"A":"Nazar\\\\n"'));
