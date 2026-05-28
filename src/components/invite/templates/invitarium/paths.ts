/** Базовый URL статики Invitarium (зеркало из C:\\My Web Sites\\asdasd\\invitarium.io\\build). */
export function invitariumBuildBase(): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/invite-assets/invitarium/build`;
}

export function invitariumLuxonUrl(): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/invite-assets/invitarium/luxon.min.js`;
}

export function maket12AssetUrl(name: string): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/invite-assets/maket12/${name}`;
}
