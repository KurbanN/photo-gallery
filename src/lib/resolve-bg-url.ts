const LEGACY_DEFAULT_BG = 'login-bg.jpg';

function isLegacyPlaceholder(url: string): boolean {
  return url.includes(LEGACY_DEFAULT_BG);
}

/** URL фона входа гостя или null — без картинки по умолчанию. */
export function resolveBgUrl(url?: string): string | null {
  const raw = url?.trim();
  if (!raw || isLegacyPlaceholder(raw)) return null;
  if (raw.startsWith('http')) return raw;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}
