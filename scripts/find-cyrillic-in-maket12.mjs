import fs from 'fs';

const h = fs.readFileSync(
  'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html',
  'utf8'
);

function decodeUnicode(s) {
  return s.replace(/\\u([0-9a-f]{4})/gi, (_, c) =>
    String.fromCharCode(parseInt(c, 16))
  );
}

const chunks = [];
for (const m of h.matchAll(/\\u04[0-9a-f]{2}(?:\\u[0-9a-f]{4})+/gi)) {
  chunks.push(decodeUnicode(m[0]));
}
for (const m of h.matchAll(/"([^"\\]{0,3}[\u0400-\u04FF][^"\\]{2,300})"/g)) {
  chunks.push(m[1]);
}

const unique = [...new Set(chunks)].filter((s) => s.length > 2);
unique.sort((a, b) => b.length - a.length);
for (const s of unique.slice(0, 50)) {
  console.log('---');
  console.log(s);
}
console.log('count', unique.length);
