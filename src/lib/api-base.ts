/**
 * Базовый URL API.
 * - dev: пусто → Vite проксирует /api на localhost:8787
 * - prod (GitHub Pages): обязателен VITE_API_BASE_URL при сборке (отдельный хост Express)
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') ?? '';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (base) return `${base}${p}`;
  if (import.meta.env.DEV) return p;
  return p;
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBaseUrl()) || import.meta.env.DEV;
}

export function apiNotConfiguredMessage(): string {
  if (import.meta.env.DEV) {
    return 'Запустите `npm run dev` (фронт + сервер на :8787).';
  }
  return (
    'API не настроен для продакшена. В GitHub: Settings → Variables → ' +
    'VITE_API_BASE_URL = URL вашего сервера (Render/Fly), затем пересоберите Pages. ' +
    'См. .github/DEPLOY.md'
  );
}
