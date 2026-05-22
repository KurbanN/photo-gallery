/** Старый статический фон в public/ (не загрузка организатора). */
function isLegacyStaticAsset(url: string): boolean {
  const raw = url.trim();
  if (!raw) return false;
  // Загруженный фон в Supabase Storage — всегда показываем
  if (raw.includes('supabase.co/storage') || raw.includes('/branding/login-bg')) return false;
  if (raw === '/login-bg.jpg' || raw === 'login-bg.jpg') return true;
  if (raw.endsWith('/login-bg.jpg') && !raw.includes('/events/')) return true;
  return false;
}

/** URL фона входа гостя или null — без картинки по умолчанию. */
export function resolveBgUrl(url?: string): string | null {
  const raw = url?.trim();
  if (!raw || isLegacyStaticAsset(raw)) return null;
  if (raw.startsWith('http')) return raw;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}
