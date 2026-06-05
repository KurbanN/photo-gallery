import { createClient } from './supabase/client';
import { apiNotConfiguredMessage, apiUrl, isApiConfigured } from './api-base';
import { parseApiJson } from './http';

function assertApi() {
  if (!isApiConfigured()) throw new Error(apiNotConfiguredMessage());
}

async function authHeaders(): Promise<HeadersInit> {
  assertApi();
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Нужен вход');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export type OrganizerRole = 'admin' | 'organizer' | 'client' | 'pending';
export type GrantableRole = 'organizer' | 'client';

export type OrganizerProfile = {
  id: string;
  email: string | null;
  role: OrganizerRole;
  event_create_limit?: number | null;
  events_created?: number;
  can_create_event?: boolean;
};

export async function fetchMe(): Promise<OrganizerProfile> {
  assertApi();
  const res = await fetch(apiUrl('/api/v1/organizer/me'), { headers: await authHeaders() });
  const body = await parseApiJson<{ profile?: OrganizerProfile; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  if (!body.profile) throw new Error('Нет профиля');
  return body.profile;
}

export type EventSettings = {
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  loginBgUrl?: string;
  headerSubtitle?: string;
  qrCardVariant?: 'classic' | 'minimal' | 'botanical' | 'noir';
  seatsEnabled?: boolean;
  seatsWelcomeMessage?: string;
  seatsShowTablemates?: boolean;
  seatsShowSeatNumber?: boolean;
};

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  plan: string;
  photo_limit: number;
  moderation_enabled: boolean;
  pin_enabled?: boolean;
  /** Код для гостей (только в кабинете организатора/админа) */
  pin?: string | null;
  ends_at: string | null;
  settings: EventSettings;
};

function authHeadersMultipart(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function listEvents(): Promise<EventRow[]> {
  const res = await fetch(apiUrl('/api/v1/organizer/events'), { headers: await authHeaders() });
  const body = await parseApiJson<{ events?: EventRow[]; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  return body.events ?? [];
}

export async function createEvent(payload: {
  title: string;
  slug?: string;
  plan?: string;
  endsAt?: string;
  settings?: EventSettings;
}): Promise<{ event: EventRow; pin: string; guestUrl: string }> {
  const res = await fetch(apiUrl('/api/v1/organizer/events'), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Ошибка создания');
  return body;
}

export async function getEvent(id: string): Promise<{ event: EventRow; guestUrl: string }> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${id}`), {
    headers: await authHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  return body;
}

export async function updateEvent(
  id: string,
  patch: { title?: string; settings?: EventSettings; pin?: string },
): Promise<EventRow> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${id}`), {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(patch),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Ошибка сохранения');
  return body.event;
}

export async function deleteAdminEvent(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/admin/events/${id}`), {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error || 'Не удалось удалить');
}

export async function uploadLoginBg(
  eventId: string,
  file: File,
): Promise<{ loginBgUrl: string; event: EventRow }> {
  assertApi();
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Нужен вход');
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/login-bg`), {
    method: 'POST',
    headers: authHeadersMultipart(token),
    body: form,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Не удалось загрузить фон');
  return body;
}

export async function endEvent(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${id}/end`), {
    method: 'POST',
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Ошибка');
  }
}

export type OrgPhoto = {
  id: string;
  url: string;
  createdAt: string;
  author?: string;
  status?: string;
};

export async function listEventPhotos(id: string): Promise<OrgPhoto[]> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${id}/photos`), {
    headers: await authHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  return body.photos ?? [];
}

/** Скачать все одобренные фото и видео мероприятия одним ZIP. */
export async function downloadEventPhotosZip(eventId: string, slug: string): Promise<void> {
  assertApi();
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Нужен вход');

  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/photos/download.zip`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await parseApiJson<{ error?: string }>(res).catch(() => ({ error: 'Ошибка' }));
    throw new Error(body.error || 'Не удалось скачать архив');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-photos.zip`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function deleteOrgPhoto(eventId: string, photoId: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/photos/${photoId}`), {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Ошибка');
  }
}

export function qrUrl(eventId: string): string {
  return apiUrl(`/api/v1/organizer/events/${eventId}/qr`);
}

export type AdminOrganizerRow = {
  id: string;
  email: string | null;
  role: OrganizerRole;
  event_create_limit: number | null;
  events_created: number;
  created_at: string;
};

export type AdminInviteRow = {
  id: string;
  email: string;
  role: GrantableRole;
  created_at: string;
};

export async function listAdminOrganizers(): Promise<{
  organizers: AdminOrganizerRow[];
  invites: AdminInviteRow[];
}> {
  const res = await fetch(apiUrl('/api/v1/admin/organizers'), { headers: await authHeaders() });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  return body;
}

export async function grantAccess(email: string, role: GrantableRole): Promise<string> {
  const res = await fetch(apiUrl('/api/v1/admin/organizers/grant'), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ email, role }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  return (body as { message?: string }).message || 'Готово';
}

export async function addClientEventSlot(organizerId: string): Promise<string> {
  const res = await fetch(apiUrl(`/api/v1/admin/organizers/${organizerId}/add-event-slot`), {
    method: 'POST',
    headers: await authHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  return (body as { message?: string }).message || 'Лимит увеличен';
}

export async function revokeOrganizer(email: string): Promise<void> {
  const res = await fetch(apiUrl('/api/v1/admin/organizers/revoke'), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ email }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Ошибка');
}

export async function downloadQr(eventId: string, slug: string): Promise<void> {
  const res = await fetch(qrUrl(eventId), { headers: await authHeaders() });
  if (!res.ok) throw new Error('QR');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `qr-${slug}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export type EventGuest = {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  tableNumber: string;
  seatNumber: string | null;
  phone: string | null;
  groupName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventGuestInput = {
  firstName: string;
  lastName?: string;
  tableNumber: string;
  seatNumber?: string | null;
  phone?: string | null;
  groupName?: string | null;
  notes?: string | null;
};

export function seatsQrUrl(eventId: string): string {
  return apiUrl(`/api/v1/organizer/events/${eventId}/seats/qr`);
}

export async function fetchGuestStats(eventId: string): Promise<{ total: number; tables: number }> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/guests/stats`), {
    headers: await authHeaders(),
  });
  const body = await parseApiJson<{ total?: number; tables?: number; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  return { total: body.total ?? 0, tables: body.tables ?? 0 };
}

export async function fetchGuestTables(eventId: string): Promise<string[]> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/guests/tables`), {
    headers: await authHeaders(),
  });
  const body = await parseApiJson<{ tables?: string[]; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  return body.tables ?? [];
}

export async function listGuests(
  eventId: string,
  opts: { page?: number; limit?: number; q?: string; table?: string } = {},
): Promise<{ guests: EventGuest[]; total: number }> {
  const params = new URLSearchParams();
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));
  if (opts.q) params.set('q', opts.q);
  if (opts.table) params.set('table', opts.table);
  const qs = params.toString();
  const res = await fetch(
    apiUrl(`/api/v1/organizer/events/${eventId}/guests${qs ? `?${qs}` : ''}`),
    { headers: await authHeaders() },
  );
  const body = await parseApiJson<{ guests?: EventGuest[]; total?: number; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  return { guests: body.guests ?? [], total: body.total ?? 0 };
}

export async function createGuest(eventId: string, input: EventGuestInput): Promise<EventGuest> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/guests`), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  const body = await parseApiJson<{ guest?: EventGuest; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  if (!body.guest) throw new Error('Нет данных');
  return body.guest;
}

export async function updateGuest(
  eventId: string,
  guestId: string,
  input: EventGuestInput,
): Promise<EventGuest> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/guests/${guestId}`), {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  const body = await parseApiJson<{ guest?: EventGuest; error?: string }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка');
  if (!body.guest) throw new Error('Нет данных');
  return body.guest;
}

export async function deleteGuest(eventId: string, guestId: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/guests/${guestId}`), {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  const body = await parseApiJson<{ error?: string }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка');
}

export async function importGuests(
  eventId: string,
  guests: EventGuestInput[],
  mode: 'replace' | 'append',
): Promise<{ imported: number; skipped?: number; errors?: string[] }> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/guests/import`), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ guests, mode }),
  });
  const body = await parseApiJson<{
    imported?: number;
    skipped?: number;
    errors?: string[];
    error?: string;
  }>(res);
  if (!res.ok) throw new Error(body.error || 'Ошибка импорта');
  return { imported: body.imported ?? 0, skipped: body.skipped, errors: body.errors };
}

export async function exportGuestsCsv(eventId: string, slug: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/organizer/events/${eventId}/guests/export`), {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await parseApiJson<{ error?: string }>(res).catch(() => ({ error: 'Ошибка' }));
    throw new Error(body.error || 'Ошибка экспорта');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-guests.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadSeatsQr(eventId: string, slug: string): Promise<void> {
  const res = await fetch(seatsQrUrl(eventId), { headers: await authHeaders() });
  if (!res.ok) throw new Error('QR');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `qr-seats-${slug}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
