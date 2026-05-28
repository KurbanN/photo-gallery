import type { InviteData } from '@/lib/invite-api';
import { buildMaket12TextPatches } from './patchMaket12Html';

/** Query для iframe maket12: timerDate + base64(JSON patches). */
export function buildMaket12ShellQuery(invite: InviteData): string {
  const q = new URLSearchParams();
  const day = invite.date?.slice(0, 10);
  if (day) q.set('timerDate', day);

  const patches = buildMaket12TextPatches(invite);
  if (patches.length > 0) {
    const json = JSON.stringify(patches);
    q.set('p', btoa(unescape(encodeURIComponent(json))));
  }

  return q.toString();
}
