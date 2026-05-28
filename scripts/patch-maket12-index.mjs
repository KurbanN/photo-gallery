import fs from 'fs';

const INDEX = 'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html';
const SHELL = '/invite-assets/maket12-shell/';
const ASSETS = `${SHELL}_assets/`;

let html = fs.readFileSync(INDEX, 'utf8');

html = html.replaceAll(
  'https://invitarium.io/t/6e950298a33c648472',
  '/invite-assets/invitarium-pages/t/6e950298a33c648472.html',
);
html = html.replaceAll(
  'https://invitarium.io/f/eb5daa0293f020daa2',
  '/invite-assets/invitarium-pages/f/eb5daa0293f020daa2.html',
);

// Абсолютные URL — иначе при blob/srcDoc preload ломается
html = html.replaceAll('href="_assets/', `href="${ASSETS}`);
html = html.replaceAll("href='_assets/", `href='${ASSETS}`);
html = html.replaceAll('src="_assets/', `src="${ASSETS}`);
html = html.replaceAll("src='_assets/", `src='${ASSETS}`);

html = html.replace(
  /window\['__canva_public_path__'\]\s*=\s*'[^']*';/,
  `window['__canva_public_path__'] = '${ASSETS}';`,
);

if (!html.includes('maket12-shell/host.js')) {
  html = html.replace(
    '<base href="/invite-assets/maket12-shell/">',
    `<base href="${SHELL}"><script src="${SHELL}host.js"></script>`,
  );
}

// Убрать инлайн resize из patchMaket12Html, если попал в index
html = html.replace(/<script>\(function\(\)\{function post\(\)\{try\{window\.parent\.postMessage\(\{type:'maket12-resize'[\s\S]*?<\/script>/g, '');

fs.writeFileSync(INDEX, html);
console.log('Patched maket12 index (absolute assets + host.js)');
