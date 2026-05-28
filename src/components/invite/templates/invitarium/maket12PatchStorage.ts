import type { Maket12TextPatch } from './patchMaket12Html';

const PREFIX = 'maket12-patches:';

export function storeMaket12Patches(patches: Maket12TextPatch[]): string {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  try {
    sessionStorage.setItem(`${PREFIX}${id}`, JSON.stringify(patches));
  } catch {
    /* sessionStorage full or private mode */
  }
  return id;
}
