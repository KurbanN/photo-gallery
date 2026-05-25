import type { PhotoEntry } from './guest-api';

/** Имена файлов из demo-photo/ (копируются в public/demo-photos при сборке). */
const DEMO_FILES = [
  'ad48f30250ffedccabc60121dda07e4e.jpg',
  'e86f5369f1f229a57b631c2c876aa993.jpg',
  'fcaaa6f25e4e18abed81e62278f65d4a.jpg',
  '3bb29fd6d58cbd8927b2013d10168671.jpg',
  '2cba97a7d481b8f677f53b08a7da221b.jpg',
  '5b8d651e04696f48f814a451c47ea7a7.jpg',
] as const;

const DEMO_AUTHORS = ['Айгуль', 'Данияр', 'Гость', 'Стол 12', 'Бауыржан', 'Семья'];

export function isDemoStaticPhotoId(id: string): boolean {
  return id.startsWith('demo-static-');
}

/** Локальные превью для /e/demo, если API ещё без сида. */
export function buildDemoStaticPhotos(): PhotoEntry[] {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const now = Date.now();
  return DEMO_FILES.map((name, i) => ({
    id: `demo-static-${i}`,
    url: `${base}demo-photos/${name}`,
    createdAt: new Date(now - (DEMO_FILES.length - i) * 45 * 60_000).toISOString(),
    author: DEMO_AUTHORS[i % DEMO_AUTHORS.length],
    status: 'approved',
    mediaType: 'image',
  }));
}
