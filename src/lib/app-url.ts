/** Путь внутри SPA с учётом VITE_BASE_PATH (без origin). */
export function appPath(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '') || '';
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${base}${segment}` || segment;
}

export function absoluteAppUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  const p = appPath(path);
  return `${window.location.origin}${p.startsWith('/') ? p : `/${p}`}`;
}

export function guestEventPath(slug: string): string {
  return appPath(`/e/${encodeURIComponent(slug)}`);
}

export function liveDisplayPath(slug: string): string {
  return appPath(`/e/${encodeURIComponent(slug)}/live`);
}

export function liveDisplayUrl(slug: string): string {
  return absoluteAppUrl(`/e/${encodeURIComponent(slug)}/live`);
}

export function guestEventUrl(slug: string): string {
  return absoluteAppUrl(`/e/${encodeURIComponent(slug)}`);
}
