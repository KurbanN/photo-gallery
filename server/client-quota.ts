import { getSupabase } from './supabase.js';
import type { OrganizerProfile, OrganizerRole } from './roles-db.js';

export async function countOrganizerEvents(organizerId: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('organizer_id', organizerId);
  if (error) throw error;
  return count ?? 0;
}

export function hasUnlimitedEventCreates(role: OrganizerRole): boolean {
  return role === 'admin' || role === 'organizer';
}

export function canCreateEvent(
  profile: Pick<OrganizerProfile, 'role' | 'event_create_limit'>,
  eventsCreated: number,
): boolean {
  if (hasUnlimitedEventCreates(profile.role)) return true;
  if (profile.role !== 'client') return false;
  const limit = profile.event_create_limit ?? 0;
  return eventsCreated < limit;
}

export async function assertCanCreateEvent(profile: OrganizerProfile): Promise<void> {
  const created = await countOrganizerEvents(profile.id);
  if (!canCreateEvent(profile, created)) {
    throw new Error('EVENT_CREATE_LIMIT');
  }
}

export type OrganizerProfileWithQuota = OrganizerProfile & {
  events_created: number;
  can_create_event: boolean;
};

export async function withEventQuota(profile: OrganizerProfile): Promise<OrganizerProfileWithQuota> {
  const events_created = await countOrganizerEvents(profile.id);
  return {
    ...profile,
    events_created,
    can_create_event: canCreateEvent(profile, events_created),
  };
}
