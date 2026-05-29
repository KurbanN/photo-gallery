import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dist = join(process.cwd(), 'dist');
const indexPath = join(dist, 'index.html');

if (!existsSync(indexPath)) {
  console.error('[verify] dist/index.html не найден — сначала выполните vite build');
  process.exit(1);
}

const indexHtml = readFileSync(indexPath, 'utf8');
const badSrcPattern = /src\s*=\s*["']\/src\/[^"']+\.(tsx?|jsx?)["']/i;
if (badSrcPattern.test(indexHtml)) {
  console.error('[verify] index.html всё ещё ссылается на /src/* — это dev-шаблон, сборка не прошла');
  process.exit(1);
}

if (!/assets\//.test(indexHtml) && !/assets\\/i.test(indexHtml)) {
  console.warn('[verify] в index.html нет ссылок на assets/ — проверьте вручную');
}

const assetsDir = join(dist, 'assets');
if (!existsSync(assetsDir)) {
  console.error('[verify] папка dist/assets отсутствует');
  process.exit(1);
}

const assetFiles = readdirSync(assetsDir);
const hasJs = assetFiles.some((f) => f.endsWith('.js'));
const hasCss = assetFiles.some((f) => f.endsWith('.css'));
if (!hasJs) {
  console.error('[verify] в dist/assets нет .js');
  process.exit(1);
}

function scanDir(dir, rel = '') {
  const issues = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${name.name}` : name.name;
    const full = join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'src') issues.push(relPath);
      else issues.push(...scanDir(full, relPath));
    } else if (/\.(tsx?|jsx?)$/i.test(name.name) && !relPath.includes('node_modules')) {
      issues.push(relPath);
    }
  }
  return issues;
}

const sourceLeaks = scanDir(dist).filter((p) => p.startsWith('src/') || p === 'src');
if (sourceLeaks.length) {
  console.error('[verify] в dist попали исходники:', sourceLeaks.join(', '));
  process.exit(1);
}

console.log('[verify] OK: index.html, assets/ (%d файлов), без /src/*.tsx', assetFiles.length);
if (!hasCss) console.log('[verify] CSS в assets не найден (возможно один бандл без отдельного css)');
