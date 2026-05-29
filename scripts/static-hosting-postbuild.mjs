import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const dist = join(process.cwd(), 'dist');
const index = join(dist, 'index.html');

if (!existsSync(index)) {
  console.error('[hosting] dist/index.html not found');
  process.exit(1);
}

// Запасной вариант, если mod_rewrite недоступен (редко на PS.KZ)
copyFileSync(index, join(dist, '404.html'));
console.log('[hosting] index.html → 404.html (запас для SPA)');
