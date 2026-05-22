import { getRuntimeConfig } from './runtime-config';

/** Куда Supabase вернёт пользователя после magic link (должен быть в Redirect URLs). */
export function getOrganizerAuthRedirectUrl(): string {
  const cfg = getRuntimeConfig();
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const dashboardPath = `${basePath}dashboard`.replace(/\/{2,}/g, '/');

  const appUrl = cfg.appUrl?.replace(/\/+$/, '');
  if (appUrl) {
    return new URL(dashboardPath, appUrl.endsWith('/') ? appUrl : `${appUrl}/`).href;
  }

  return new URL(dashboardPath, window.location.origin).href;
}
