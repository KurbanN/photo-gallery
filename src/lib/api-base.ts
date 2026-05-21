import { getRuntimeConfig } from './runtime-config';

/**
 * Базовый URL API.
 * - dev: пусто → Vite проксирует /api на localhost:8787
 * - prod: VITE_API_BASE_URL при сборке или apiBaseUrl в app-config.json
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  try {
    return getRuntimeConfig().apiBaseUrl ?? '';
  } catch {
    return '';
  }
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
    return 'Запустите `npm run dev` (фронт + сервер :8787).';
  }
  return (
    'API не настроен. Укажите apiBaseUrl в public/app-config.json или VITE_API_BASE_URL при сборке. ' +
    'См. .github/DEPLOY.md'
  );
}
