import fs from 'fs';

const h = fs.readFileSync(
  'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html',
  'utf8'
);

// Canva bootstrap in index: "A":"...\\\\n"
const re = /"A":"((?:[^"\\]|\\.)*)\\\\n"/g;
const seen = new Set();
for (const m of h.matchAll(re)) {
  const t = m[1]
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"');
  if (/[а-яА-Яa-zA-Z0-9]/.test(t) && !t.startsWith('M') && !t.includes('://')) {
    seen.add(t);
  }
}

[...seen].sort((a, b) => b.length - a.length).forEach((t) => console.log(JSON.stringify(t)));
console.error('count', seen.size);
