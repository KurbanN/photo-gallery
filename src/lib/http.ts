/** Разбор ответа API; если пришёл HTML (404 Vite / сервер не запущен) — понятная ошибка. */
export async function parseApiJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('<')) {
    const onPages =
      typeof location !== 'undefined' && location.hostname.endsWith('github.io');
    throw new Error(
      onPages
        ? 'API недоступен (404). Задайте VITE_API_BASE_URL в GitHub Variables и задеплойте Express (Render). См. .github/DEPLOY.md'
        : 'API недоступен. Запустите `npm run dev` (фронт + сервер :8787) или задайте VITE_API_BASE_URL.',
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(trimmed.slice(0, 120) || 'Некорректный ответ сервера');
  }
}
