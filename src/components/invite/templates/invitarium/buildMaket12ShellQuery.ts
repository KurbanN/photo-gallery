import type { InviteData } from '@/lib/invite-api';
import { buildMaket12TextPatches } from './patchMaket12Html';
import { storeMaket12Patches } from './maket12PatchStorage';

/** Query для iframe maket12: patchId (sessionStorage) + timerDate. */
export function buildMaket12ShellQuery(invite: InviteData): string {
  const q = new URLSearchParams();
  const day = invite.date?.slice(0, 10);
  if (day) q.set('timerDate', day);

  const patches = buildMaket12TextPatches(invite);
  if (patches.length > 0) {
    q.set('patchId', storeMaket12Patches(patches));
  }

  return q.toString();
}
