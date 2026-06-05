import { getSupabase } from './supabase.js';
import type { EventGuestInput, EventGuestPublic, EventGuestRow, EventGuestView, EventSettings } from './types.js';

const MAX_NAME = 100;
const MAX_TABLE = 50;
const MAX_FIELD = 200;

export function normalizeSearchToken(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ');
}

export function buildSearchText(firstName: string, lastName: string): string {
  const fn = normalizeSearchToken(firstName);
  const ln = normalizeSearchToken(lastName);
  const tokens = new Set<string>();
  if (fn) tokens.add(fn);
  if (ln) tokens.add(ln);
  if (fn && ln) {
    tokens.add(`${fn} ${ln}`);
    tokens.add(`${ln} ${fn}`);
    tokens.add(`${ln} ${fn.charAt(0)}`);
    tokens.add(`${fn} ${ln.charAt(0)}`);
  }
  return [...tokens].join(' ');
}

function trimField(value: string | undefined | null, max: number): string {
  return (value ?? '').trim().slice(0, max);
}

export function sanitizeGuestInput(input: EventGuestInput): EventGuestInput {
  const firstName = trimField(input.firstName, MAX_NAME);
  const lastName = trimField(input.lastName, MAX_NAME);
  const tableNumber = trimField(input.tableNumber, MAX_TABLE);
  if (!firstName) throw new Error('FIRST_NAME_REQUIRED');
  if (!tableNumber) throw new Error('TABLE_REQUIRED');
  return {
    firstName,
    lastName,
    tableNumber,
    seatNumber: trimField(input.seatNumber, MAX_TABLE) || null,
    phone: trimField(input.phone, MAX_FIELD) || null,
    groupName: trimField(input.groupName, MAX_FIELD) || null,
    notes: trimField(input.notes, 500) || null,
  };
}

function rowToView(row: EventGuestRow): EventGuestView {
  return {
    id: row.id,
    eventId: row.event_id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    tableNumber: row.table_number,
    seatNumber: row.seat_number,
    phone: row.phone,
    groupName: row.group_name,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToPublic(row: EventGuestRow): EventGuestPublic {
  return {
    id: row.id,
    fullName: row.full_name,
    tableNumber: row.table_number,
    seatNumber: row.seat_number,
  };
}

function dbInsertPayload(eventId: string, input: EventGuestInput) {
  const clean = sanitizeGuestInput(input);
  return {
    event_id: eventId,
    first_name: clean.firstName,
    last_name: clean.lastName ?? '',
    table_number: clean.tableNumber,
    seat_number: clean.seatNumber ?? null,
    phone: clean.phone ?? null,
    group_name: clean.groupName ?? null,
    notes: clean.notes ?? null,
    search_text: buildSearchText(clean.firstName, clean.lastName ?? ''),
    updated_at: new Date().toISOString(),
  };
}

export async function countEventGuests(eventId: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('event_guests')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);
  if (error) throw error;
  return count ?? 0;
}

export async function countEventTables(eventId: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_guests')
    .select('table_number')
    .eq('event_id', eventId);
  if (error) throw error;
  const tables = new Set((data ?? []).map((r) => (r as { table_number: string }).table_number));
  return tables.size;
}

export async function listEventGuests(
  eventId: string,
  opts: { page?: number; limit?: number; q?: string; table?: string } = {},
): Promise<{ guests: EventGuestView[]; total: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = getSupabase();
  let query = supabase
    .from('event_guests')
    .select('*', { count: 'exact' })
    .eq('event_id', eventId)
    .order('table_number', { ascending: true })
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (opts.table?.trim()) {
    query = query.eq('table_number', opts.table.trim());
  }

  const q = opts.q?.trim();
  if (q) {
    const tokens = q.split(/\s+/).map(normalizeSearchToken).filter((t) => t.length >= 1);
    for (const token of tokens) {
      query = query.ilike('search_text', `%${token}%`);
    }
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return {
    guests: (data as EventGuestRow[]).map(rowToView),
    total: count ?? 0,
  };
}

export async function getEventGuestById(
  eventId: string,
  guestId: string,
): Promise<EventGuestRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_guests')
    .select('*')
    .eq('event_id', eventId)
    .eq('id', guestId)
    .maybeSingle();
  if (error) throw error;
  return data as EventGuestRow | null;
}

export async function createEventGuest(
  eventId: string,
  input: EventGuestInput,
): Promise<EventGuestView> {
  const supabase = getSupabase();
  const payload = dbInsertPayload(eventId, input);
  const { data, error } = await supabase.from('event_guests').insert(payload).select('*').single();
  if (error) throw error;
  return rowToView(data as EventGuestRow);
}

export async function updateEventGuest(
  eventId: string,
  guestId: string,
  input: EventGuestInput,
): Promise<EventGuestView> {
  const supabase = getSupabase();
  const clean = sanitizeGuestInput(input);
  const { data, error } = await supabase
    .from('event_guests')
    .update({
      first_name: clean.firstName,
      last_name: clean.lastName ?? '',
      table_number: clean.tableNumber,
      seat_number: clean.seatNumber ?? null,
      phone: clean.phone ?? null,
      group_name: clean.groupName ?? null,
      notes: clean.notes ?? null,
      search_text: buildSearchText(clean.firstName, clean.lastName ?? ''),
      updated_at: new Date().toISOString(),
    })
    .eq('event_id', eventId)
    .eq('id', guestId)
    .select('*')
    .single();
  if (error) throw error;
  if (!data) throw new Error('NOT_FOUND');
  return rowToView(data as EventGuestRow);
}

export async function deleteEventGuest(eventId: string, guestId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('event_guests')
    .delete()
    .eq('event_id', eventId)
    .eq('id', guestId);
  if (error) throw error;
}

export async function deleteAllEventGuests(eventId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('event_guests').delete().eq('event_id', eventId);
  if (error) throw error;
}

export async function importEventGuests(
  eventId: string,
  guests: EventGuestInput[],
  mode: 'replace' | 'append',
): Promise<{ imported: number }> {
  if (mode === 'replace') {
    await deleteAllEventGuests(eventId);
  }

  const batchSize = 200;
  let imported = 0;
  for (let i = 0; i < guests.length; i += batchSize) {
    const chunk = guests.slice(i, i + batchSize).map((g) => {
      try {
        return dbInsertPayload(eventId, g);
      } catch {
        return null;
      }
    }).filter(Boolean) as ReturnType<typeof dbInsertPayload>[];

    if (chunk.length === 0) continue;
    const supabase = getSupabase();
    const { error } = await supabase.from('event_guests').insert(chunk);
    if (error) throw error;
    imported += chunk.length;
  }
  return { imported };
}

export async function listAllGuestsForExport(eventId: string): Promise<EventGuestView[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_guests')
    .select('*')
    .eq('event_id', eventId)
    .order('table_number')
    .order('last_name')
    .order('first_name');
  if (error) throw error;
  return (data as EventGuestRow[]).map(rowToView);
}

export async function listDistinctTables(eventId: string): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_guests')
    .select('table_number')
    .eq('event_id', eventId);
  if (error) throw error;
  const tables = [...new Set((data ?? []).map((r) => (r as { table_number: string }).table_number))];
  return tables.sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));
}

export function readSeatsSettings(settings: EventSettings | undefined) {
  const s = settings ?? {};
  return {
    enabled: s.seatsEnabled !== false,
    welcomeMessage: s.seatsWelcomeMessage?.trim() || '',
    showTablemates: s.seatsShowTablemates !== false,
    showSeatNumber: s.seatsShowSeatNumber !== false,
  };
}

export async function searchEventGuestsPublic(
  eventId: string,
  query: string,
  limit = 8,
): Promise<EventGuestPublic[]> {
  const tokens = query
    .split(/\s+/)
    .map(normalizeSearchToken)
    .filter((t) => t.length >= 1);
  if (tokens.length === 0) return [];

  const supabase = getSupabase();
  let q = supabase
    .from('event_guests')
    .select('id, full_name, table_number, seat_number, search_text')
    .eq('event_id', eventId)
    .limit(Math.min(limit, 20));

  for (const token of tokens) {
    q = q.ilike('search_text', `%${token}%`);
  }

  const { data, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as Pick<EventGuestRow, 'id' | 'full_name' | 'table_number' | 'seat_number'>[];
  return rows.slice(0, limit).map((r) => ({
    id: r.id,
    fullName: r.full_name,
    tableNumber: r.table_number,
    seatNumber: r.seat_number,
  }));
}

export async function getGuestWithTablemates(
  eventId: string,
  guestId: string,
  showTablemates: boolean,
): Promise<{ guest: EventGuestPublic; tablemates: EventGuestPublic[] } | null> {
  const guest = await getEventGuestById(eventId, guestId);
  if (!guest) return null;

  let tablemates: EventGuestPublic[] = [];
  if (showTablemates) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('event_guests')
      .select('id, full_name, table_number, seat_number')
      .eq('event_id', eventId)
      .eq('table_number', guest.table_number)
      .neq('id', guestId)
      .order('full_name')
      .limit(30);
    if (error) throw error;
    tablemates = (data ?? []).map((r) =>
      rowToPublic(r as EventGuestRow),
    );
  }

  return { guest: rowToPublic(guest), tablemates };
}

export function guestsToCsv(guests: EventGuestView[]): string {
  const header = 'firstName,lastName,tableNumber,seatNumber,phone,groupName,notes';
  const escape = (v: string | null | undefined) => {
    const s = (v ?? '').replace(/"/g, '""');
    if (/^[=+\-@]/.test(s)) return `"'"${s}"`;
    if (/[",\n]/.test(s)) return `"${s}"`;
    return s;
  };
  const lines = guests.map((g) =>
    [
      escape(g.firstName),
      escape(g.lastName),
      escape(g.tableNumber),
      escape(g.seatNumber),
      escape(g.phone),
      escape(g.groupName),
      escape(g.notes),
    ].join(','),
  );
  return '\uFEFF' + [header, ...lines].join('\n');
}
