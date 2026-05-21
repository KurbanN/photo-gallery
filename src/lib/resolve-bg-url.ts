/** Публичный URL фона входа гостя (относительный путь или Supabase). */
export function resolveBgUrl(url?: string): string {
  if (!url) return `${import.meta.env.BASE_URL}login-bg.jpg`;
  if (url.startsWith('http')) return url;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}
