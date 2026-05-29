import { publicAssetUrl } from '@/lib/public-asset-url';

/** Префикс для путей из public/invite-assets (пустой или `/photo-gallery`). */
export function inviteAssetsPrefix(): string {
  return import.meta.env.BASE_URL.replace(/\/?$/, '');
}

/** Базовый URL статики Invitarium (зеркало invitarium.io/build). */
export function invitariumBuildBase(): string {
  return publicAssetUrl('invite-assets/invitarium/build');
}

export function invitariumLuxonUrl(): string {
  return publicAssetUrl('invite-assets/invitarium/luxon.min.js');
}

export function maket12ShellIndexUrl(): string {
  return publicAssetUrl('invite-assets/maket12-shell/index.html');
}

export function maket12ShellBase(): string {
  return publicAssetUrl('invite-assets/maket12-shell/');
}

/** Дата/время для Luxon `fromSQL` в странице таймера (локальное время события). */
export function formatTimerDateParam(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso.slice(0, 10);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${day} ${h}:${mi}:00`;
}

export function invitariumTimerPageUrl(
  dateIso: string | null,
  opts?: { absolute?: boolean },
): string {
  const page = publicAssetUrl('invite-assets/invitarium-pages/t/6e950298a33c648472.html');
  const url = dateIso
    ? `${page}?date=${encodeURIComponent(formatTimerDateParam(dateIso))}`
    : page;
  if (opts?.absolute && typeof window !== 'undefined') {
    return new URL(url, window.location.origin).href;
  }
  return url;
}

export function invitariumFormPageUrl(): string {
  return publicAssetUrl('invite-assets/invitarium-pages/f/eb5daa0293f020daa2.html');
}

/** Подставляет BASE_URL (GitHub Pages) в абсолютные пути `/invite-assets/…` внутри HTML. */
export function rewriteInviteAssetPaths(html: string): string {
  const prefix = inviteAssetsPrefix();
  if (!prefix) return html;
  const rooted = `${prefix}/invite-assets/`;
  if (html.includes(rooted)) return html;
  return html.replaceAll('/invite-assets/', rooted);
}
