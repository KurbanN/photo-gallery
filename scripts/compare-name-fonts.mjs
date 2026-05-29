import fs from 'fs';

const h = fs.readFileSync('public/invite-assets/maket12-shell/index.html', 'utf8');

function inspect(name) {
  const needle = `"A":"${name}`;
  let pos = 0;
  let n = 0;
  while (true) {
    const i = h.indexOf(needle, pos);
    if (i < 0) break;
    n++;
    pos = i + 1;
    const chunk = h.slice(Math.max(0, i - 2500), i + name.length + 400);
    const fsz = [...chunk.matchAll(/"font-size":\{[^}]+\}/g)].pop()?.[0];
    const ff = chunk.match(/"font-family":\{[^}]+\}/)?.[0];
    const hidden = /"hidden":\{"B":true\}/.test(chunk) || /"L":true/.test(chunk.slice(-800));
    const w = chunk.match(/"width":\{[^}]+\}/)?.[0];
    console.log(`--- ${name} #${n} ---`);
    console.log('font-size', fsz);
    console.log('font-family', ff);
    console.log('width', w);
    console.log('hidden-ish', hidden);
  }
  if (n === 0) console.log(name, 'not found');
}

inspect('Nazar');
inspect('Anita');
