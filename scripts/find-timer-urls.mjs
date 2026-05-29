import fs from 'fs';

const h = fs.readFileSync('public/invite-assets/maket12-shell/index.html', 'utf8');
const needles = ['6e950298', 'invitarium.io/t', 'invitarium-pages'];
for (const n of needles) {
  let i = 0;
  let c = 0;
  while ((i = h.indexOf(n, i + 1)) >= 0) {
    c++;
    if (c <= 3) console.log(n, '#', c, h.slice(i, i + 180));
  }
  console.log(n, 'total', c);
}
