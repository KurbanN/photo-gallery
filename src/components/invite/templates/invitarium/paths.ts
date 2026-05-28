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

export function invitariumTimerPageUrl(dateIso: string | null): string {
  const page = publicAssetUrl('invite-assets/invitarium-pages/t/6e950298a33c648472.html');
  if (!dateIso) return page;
  return `${page}?date=${encodeURIComponent(dateIso.slice(0, 10))}`;
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
