import { useEffect } from 'react';

/** Единое имя продукта в UI и во вкладке браузера */
export const APP_BRAND = 'Allmemories';

export function formatPageTitle(page?: string): string {
  const trimmed = page?.trim();
  return trimmed ? `${trimmed} — ${APP_BRAND}` : APP_BRAND;
}

/** Обновляет document.title (вкладка браузера) */
export function usePageTitle(page?: string): void {
  useEffect(() => {
    document.title = formatPageTitle(page);
  }, [page]);
}
