import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const dist = join(process.cwd(), 'dist');
const index = join(dist, 'index.html');

if (!existsSync(index)) {
  console.error('[gh-pages] dist/index.html not found — run vite build first');
  process.exit(1);
}

copyFileSync(index, join(dist, '404.html'));
console.log('[gh-pages] copied index.html → 404.html (SPA deep links)');

const demoSrc = join(process.cwd(), 'demo-photo');
const demoDest = join(dist, 'demo-photos');
if (existsSync(demoSrc)) {
  mkdirSync(demoDest, { recursive: true });
  const imgs = readdirSync(demoSrc).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
  for (const name of imgs) {
    cpSync(join(demoSrc, name), join(demoDest, name), { force: true });
  }
  console.log(`[gh-pages] demo-photos: ${imgs.length} file(s)`);
}
