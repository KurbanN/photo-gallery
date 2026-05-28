import { apiUrl } from '@/lib/api-base';
import { createClient } from '@/lib/supabase/client';
import { parseApiJson } from '@/lib/http';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type InviteTemplate = 'classic' | 'dark';
export type RSVPStatus = 'attending' | 'maybe' | 'declined';

export type InviteData = {
  eventId: string;
  slug: string;
  title: string;
  date: string | null;
  template: InviteTemplate;
  location: string;
  message: string;
};

export type RSVPResponse = {
  id: string;
  event_id: string;
  name: string;
  status: RSVPStatus;
  comment: string | null;
  created_at: string;
};

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Нужен вход');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchInvite(slug: string): Promise<InviteData> {
  const res = await fetch(apiUrl(`/api/v1/invite/${encodeURIComponent(slug)}`));
  const body = await parseApiJson<{ invite?: InviteData; error?: string }>(res);
  if (!res.ok || !body.invite) throw new Error(body.error || 'Приглашение не найдено');
  return body.invite;
}

export async function submitRSVP(slug: string, payload: {
  name: string;
  status: RSVPStatus;
  comment?: string;
}): Promise<RSVPResponse> {
  const res = await fetch(apiUrl(`/api/v1/invite/${encodeURIComponent(slug)}/rsvp`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await parseApiJson<{ response?: RSVPResponse; error?: string }>(res);
  if (!res.ok || !body.response) throw new Error(body.error || 'Не удалось отправить RSVP');
  return body.response;
}

export async function fetchInviteManageData(eventId: string): Promise<{
  invite: InviteData | null;
  responses: RSVPResponse[];
}> {
  const res = await fetch(apiUrl(`/api/v1/invite/manage/event/${encodeURIComponent(eventId)}`), {
    headers: await authHeaders(),
  });
  const body = await parseApiJson<{ invite: InviteData | null; responses: RSVPResponse[]; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка загрузки invite');
  return { invite: body.invite, responses: body.responses || [] };
}

export async function saveInvite(
  eventId: string,
  payload: {
    title: string;
    startsAt: string | null;
    template: InviteTemplate;
    location: string;
    message: string;
  },
): Promise<InviteData> {
  const res = await fetch(apiUrl(`/api/v1/invite/manage/event/${encodeURIComponent(eventId)}`), {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await parseApiJson<{ invite?: InviteData; error?: string }>(res);
  if (!res.ok || !body.invite) throw new Error(body.error || 'Ошибка сохранения invite');
  return body.invite;
}

export function createRSVPSubscription(
  eventId: string,
  onChange: () => void,
): RealtimeChannel {
  const supabase = createClient();
  const channel = supabase
    .channel(`invite-rsvp-${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rsvp_responses', filter: `event_id=eq.${eventId}` },
      () => onChange(),
    )
    .subscribe();
  return channel;
}
