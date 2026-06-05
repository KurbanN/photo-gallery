import { ApiRequestError } from './api';
import { apiNotConfiguredMessage, apiUrl, isApiConfigured } from './api-base';
import { parseApiJson } from './http';

function assertApi() {
  if (!isApiConfigured()) throw new Error(apiNotConfiguredMessage());
}

export type SeatsPublic = {
  slug: string;
  title: string;
  startsAt?: string | null;
  endsAt?: string | null;
  enabled: boolean;
  guestCount: number;
  settings: {
    welcomeTitle: string;
    welcomeMessage: string;
    loginBgUrl?: string;
    showTablemates: boolean;
    showSeatNumber: boolean;
  };
};

export type SeatSearchResult = {
  id: string;
  fullName: string;
  tableNumber: string;
  seatNumber?: string | null;
};

export type SeatLookupResponse = {
  guest: SeatSearchResult;
  tablemates: SeatSearchResult[];
  welcomeMessage: string;
  showSeatNumber: boolean;
  albumUrl: string;
  settings: { welcomeTitle: string };
};

export async function fetchSeatsPublic(slug: string): Promise<SeatsPublic> {
  assertApi();
  const res = await fetch(apiUrl(`/api/v1/e/${encodeURIComponent(slug)}/seats/public`));
  const body = await parseApiJson<SeatsPublic & { error?: string }>(res);
  if (!res.ok) throw new ApiRequestError(body.error || 'Мероприятие не найдено', res.status);
  return body;
}

export async function searchSeats(
  slug: string,
  query: string,
): Promise<{ results: SeatSearchResult[]; status: 'found' | 'ambiguous' | 'not_found' }> {
  assertApi();
  const params = new URLSearchParams({ q: query });
  const res = await fetch(
    apiUrl(`/api/v1/e/${encodeURIComponent(slug)}/seats/search?${params}`),
  );
  const body = await parseApiJson<{
    results?: SeatSearchResult[];
    status?: 'found' | 'ambiguous' | 'not_found';
    error?: string;
    code?: string;
  }>(res);
  if (!res.ok) {
    throw new ApiRequestError(body.error || 'Ошибка поиска', res.status);
  }
  return {
    results: body.results ?? [],
    status: body.status ?? 'not_found',
  };
}

export async function lookupSeat(slug: string, guestId: string): Promise<SeatLookupResponse> {
  assertApi();
  const res = await fetch(
    apiUrl(`/api/v1/e/${encodeURIComponent(slug)}/seats/${encodeURIComponent(guestId)}`),
  );
  const body = await parseApiJson<SeatLookupResponse & { error?: string }>(res);
  if (!res.ok) throw new ApiRequestError(body.error || 'Не найдено', res.status);
  return body;
}
