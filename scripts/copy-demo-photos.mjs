import { cpSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const src = join(root, 'demo-photo');
const targets = [join(root, 'public', 'demo-photos')];

if (!existsSync(src)) {
  console.warn('[copy-demo-photos] demo-photo/ не найдена — пропуск');
  process.exit(0);
}

const files = readdirSync(src).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
if (files.length === 0) {
  console.warn('[copy-demo-photos] нет изображений в demo-photo/');
  process.exit(0);
}

for (const dest of targets) {
  mkdirSync(dest, { recursive: true });
  for (const name of files) {
    cpSync(join(src, name), join(dest, name), { force: true });
  }
  console.log(`[copy-demo-photos] ${files.length} → ${dest}`);
}
