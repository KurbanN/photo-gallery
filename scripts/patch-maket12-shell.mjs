/**
 * Патчит maket12-shell/index.html: BASE_PATH, invitarium embeds, обёртка bootstrap для host.js.
 * Usage: node scripts/patch-maket12-shell.mjs [path/to/index.html]
 * Env: VITE_BASE_PATH=/photo-gallery/ (для GitHub Pages)
 */
import fs from 'fs';
import path from 'path';

const indexPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve('public/invite-assets/maket12-shell/index.html');

let base = process.env.VITE_BASE_PATH ?? '/';
base = base.replace(/\/+$/, '');
if (base && !base.startsWith('/')) base = `/${base}`;
const prefix = base && base !== '/' ? base : '';
const rooted = `${prefix}/invite-assets/`;
const shellBase = `${rooted}maket12-shell/`;
const assetsBase = `${shellBase}_assets/`;

let html = fs.readFileSync(indexPath, 'utf8');

html = html.replaceAll(
  'https://invitarium.io/t/6e950298a33c648472',
  `${rooted}invitarium-pages/t/6e950298a33c648472.html`,
);
html = html.replaceAll(
  'https://invitarium.io/f/eb5daa0293f020daa2',
  `${rooted}invitarium-pages/f/eb5daa0293f020daa2.html`,
);

// Нормализуем пути под BASE_PATH
if (prefix) {
  if (!html.includes(rooted)) {
    html = html.replaceAll('/photo-gallery/invite-assets/', rooted);
    html = html.replaceAll('/invite-assets/', rooted);
  }
} else {
  html = html.replaceAll('/photo-gallery/invite-assets/', '/invite-assets/');
}

html = html.replace(
  /window\['__canva_public_path__'\]\s*=\s*'[^']*';/,
  `window['__canva_public_path__'] = '${assetsBase}';`,
);

if (!html.includes('host.js')) {
  html = html.replace(
    /<head>/i,
    `<head><base href="${shellBase}"><script src="${shellBase}host.js"></script>`,
  );
} else {
  html = html.replace(/<base href="[^"]*">/, `<base href="${shellBase}">`);
  html = html.replace(
    /<script src="[^"]*host\.js"><\/script>/,
    `<script src="${shellBase}host.js"></script>`,
  );
}

html = wrapBootstrapParse(html);

fs.writeFileSync(indexPath, html);
console.log(`[patch-maket12-shell] ${indexPath} (base=${prefix || '/'})`);

function wrapBootstrapParse(html) {
  const marker = "window['bootstrap'] = JSON.parse('";
  const start = html.indexOf(marker);
  if (start === -1) return html;
  const jsonStart = start + marker.length;
  let pos = jsonStart;
  let esc = false;
  for (; pos < html.length; pos++) {
    const c = html[pos];
    if (esc) esc = false;
    else if (c === '\\') esc = true;
    else if (c === "'") break;
  }
  if (pos >= html.length) return html;

  const before = html.slice(0, start);
  const json = html.slice(jsonStart, pos);
  const after = html.slice(pos + 2); // skip ');
  return (
    before +
    `var __bs='${json}';if(window.__maket12ApplyPatches)__bs=window.__maket12ApplyPatches(__bs);window['bootstrap']=JSON.parse(__bs);` +
    after
  );
}
