import { getSupabase } from './supabase.js';
import { getEventById, getEventBySlug, updateEvent } from './events-db.js';
import type { EventRow } from './types.js';

export type InviteTemplate = 'classic' | 'dark';
export type RSVPStatus = 'attending' | 'maybe' | 'declined';

export type InvitePublic = {
  eventId: string;
  slug: string;
  title: string;
  date: string | null;
  template: InviteTemplate;
  location: string;
  message: string;
};

export type RSVPRow = {
  id: string;
  event_id: string;
  name: string;
  status: RSVPStatus;
  comment: string | null;
  created_at: string;
};

function readInviteFromEvent(event: EventRow): InvitePublic {
  const settings = event.settings || {};
  const template = settings.inviteTemplate === 'dark' ? 'dark' : 'classic';
  return {
    eventId: event.id,
    slug: event.slug,
    title: event.title,
    date: event.starts_at,
    template,
    location: settings.inviteLocation || '',
    message: settings.inviteMessage || '',
  };
}

export async function getInviteBySlug(slug: string): Promise<InvitePublic | null> {
  const event = await getEventBySlug(slug);
  if (!event) return null;
  return readInviteFromEvent(event);
}

export async function upsertInviteSettings(
  eventId: string,
  organizerId: string,
  payload: {
    title: string;
    startsAt: string | null;
    template: InviteTemplate;
    location: string;
    message: string;
  },
): Promise<InvitePublic> {
  const event = await updateEvent(eventId, organizerId, {
    title: payload.title.trim(),
    ends_at: undefined,
    settings: {
      inviteTemplate: payload.template,
      inviteLocation: payload.location.trim(),
      inviteMessage: payload.message.trim(),
    },
  });
  if (payload.startsAt !== event.starts_at) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('events')
      .update({ starts_at: payload.startsAt, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select('*')
      .single();
    if (error) throw error;
    return readInviteFromEvent(data as EventRow);
  }
  return readInviteFromEvent(event);
}

export async function getInviteByEventId(eventId: string): Promise<InvitePublic | null> {
  const event = await getEventById(eventId);
  if (!event) return null;
  return readInviteFromEvent(event);
}

export async function createRSVP(payload: {
  eventId: string;
  name: string;
  status: RSVPStatus;
  comment?: string;
  source?: string;
}): Promise<RSVPRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('rsvp_responses')
    .insert({
      event_id: payload.eventId,
      name: payload.name.trim(),
      status: payload.status,
      comment: payload.comment?.trim() || null,
      source: payload.source || 'web',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as RSVPRow;
}

export async function listRSVPsByEventId(eventId: string): Promise<RSVPRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('rsvp_responses')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as RSVPRow[];
}
