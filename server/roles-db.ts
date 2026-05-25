import { getSupabase } from './supabase.js';

export type OrganizerRole = 'admin' | 'organizer' | 'client' | 'pending';
export type GrantableRole = 'organizer' | 'client';

export type OrganizerProfile = {
  id: string;
  email: string | null;
  role: OrganizerRole;
  event_create_limit: number | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getPlatformAdminEmails(): Set<string> {
  const raw = process.env.PLATFORM_ADMIN_EMAILS?.trim() || 'dunga309@gmail.com';
  return new Set(
    raw
      .split(',')
      .map((e) => normalizeEmail(e))
      .filter(Boolean),
  );
}

export function isPlatformAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return getPlatformAdminEmails().has(normalizeEmail(email));
}

function limitForRole(role: OrganizerRole): number | null {
  if (role === 'client') return 1;
  if (role === 'pending') return 0;
  return null;
}

export async function resolveOrganizerProfile(
  userId: string,
  email?: string,
): Promise<OrganizerProfile> {
  const supabase = getSupabase();
  const normalized = email ? normalizeEmail(email) : null;

  if (normalized && isPlatformAdminEmail(normalized)) {
    const { data, error } = await supabase
      .from('organizers')
      .upsert(
        { id: userId, email: normalized, role: 'admin', event_create_limit: null },
        { onConflict: 'id' },
      )
      .select('id, email, role, event_create_limit')
      .single();
    if (error) throw error;
    return data as OrganizerProfile;
  }

  const { data: existing } = await supabase
    .from('organizers')
    .select('id, email, role, event_create_limit')
    .eq('id', userId)
    .maybeSingle();

  if (existing && (existing as OrganizerProfile).role !== 'pending') {
    const profile = existing as OrganizerProfile;
    if (profile.role === 'client' && profile.event_create_limit == null) {
      return { ...profile, event_create_limit: 1 };
    }
    return profile;
  }

  let role: OrganizerRole = 'pending';
  let event_create_limit = 0;

  if (normalized) {
    const { data: invite } = await supabase
      .from('organizer_invites')
      .select('role')
      .eq('email', normalized)
      .maybeSingle();
    if (invite) {
      const inviteRole = (invite as { role?: string }).role === 'client' ? 'client' : 'organizer';
      role = inviteRole;
      event_create_limit = limitForRole(role) ?? 0;
    }
  }

  const { data, error } = await supabase
    .from('organizers')
    .upsert(
      {
        id: userId,
        email: normalized ?? existing?.email ?? null,
        role,
        event_create_limit,
      },
      { onConflict: 'id' },
    )
    .select('id, email, role, event_create_limit')
    .single();
  if (error) throw error;

  if (role !== 'pending' && normalized) {
    await supabase.from('organizer_invites').delete().eq('email', normalized);
  }

  return data as OrganizerProfile;
}

export function canManageEvents(role: OrganizerRole): boolean {
  return role === 'admin' || role === 'organizer' || role === 'client';
}

export async function grantAccessByEmail(
  adminId: string,
  email: string,
  grantRole: GrantableRole = 'organizer',
): Promise<{ ok: true; status: 'invited' | 'promoted' }> {
  const supabase = getSupabase();
  const normalized = normalizeEmail(email);
  if (!normalized) throw new Error('INVALID_EMAIL');
  if (isPlatformAdminEmail(normalized)) {
    throw new Error('CANNOT_GRANT_ADMIN');
  }

  const event_create_limit = grantRole === 'client' ? 1 : null;

  const { data: authList, error: authErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (authErr) throw authErr;

  const authUser = authList.users.find((u) => u.email && normalizeEmail(u.email) === normalized);

  if (authUser) {
    const { error } = await supabase.from('organizers').upsert(
      {
        id: authUser.id,
        email: normalized,
        role: grantRole,
        event_create_limit,
      },
      { onConflict: 'id' },
    );
    if (error) throw error;
    await supabase.from('organizer_invites').delete().eq('email', normalized);
    return { ok: true, status: 'promoted' };
  }

  const { error: invErr } = await supabase.from('organizer_invites').upsert(
    { email: normalized, granted_by: adminId, role: grantRole },
    { onConflict: 'email' },
  );
  if (invErr) throw invErr;
  return { ok: true, status: 'invited' };
}

/** @deprecated use grantAccessByEmail */
export async function grantOrganizerByEmail(
  adminId: string,
  email: string,
): Promise<{ ok: true; status: 'invited' | 'promoted' }> {
  return grantAccessByEmail(adminId, email, 'organizer');
}

export async function addClientEventSlot(organizerId: string): Promise<OrganizerProfile> {
  const supabase = getSupabase();
  const { data: row, error: fetchErr } = await supabase
    .from('organizers')
    .select('id, email, role, event_create_limit')
    .eq('id', organizerId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!row) throw new Error('NOT_FOUND');
  const profile = row as OrganizerProfile;
  if (profile.role !== 'client') {
    throw new Error('NOT_CLIENT');
  }
  const nextLimit = (profile.event_create_limit ?? 0) + 1;
  const { data, error } = await supabase
    .from('organizers')
    .update({ event_create_limit: nextLimit })
    .eq('id', organizerId)
    .select('id, email, role, event_create_limit')
    .single();
  if (error) throw error;
  return data as OrganizerProfile;
}

export async function revokeOrganizerAccess(email: string): Promise<void> {
  const supabase = getSupabase();
  const normalized = normalizeEmail(email);
  if (isPlatformAdminEmail(normalized)) {
    throw new Error('CANNOT_REVOKE_ADMIN');
  }

  await supabase.from('organizer_invites').delete().eq('email', normalized);

  const { data: authList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authUser = authList?.users.find(
    (u) => u.email && normalizeEmail(u.email) === normalized,
  );
  if (authUser) {
    await supabase
      .from('organizers')
      .update({ role: 'pending', event_create_limit: 0 })
      .eq('id', authUser.id);
  }
}

export type OrganizerListItem = {
  id: string;
  email: string | null;
  role: OrganizerRole;
  event_create_limit: number | null;
  events_created: number;
  created_at: string;
};

export type PendingInvite = {
  id: string;
  email: string;
  role: GrantableRole;
  created_at: string;
};

export async function listOrganizersAndInvites(): Promise<{
  organizers: OrganizerListItem[];
  invites: PendingInvite[];
}> {
  const supabase = getSupabase();
  const { countOrganizerEvents } = await import('./client-quota.js');

  const { data: orgs, error: oErr } = await supabase
    .from('organizers')
    .select('id, email, role, event_create_limit, created_at')
    .order('created_at', { ascending: false });
  if (oErr) throw oErr;

  const organizers: OrganizerListItem[] = [];
  for (const o of orgs ?? []) {
    const events_created = await countOrganizerEvents(o.id as string);
    organizers.push({
      ...(o as OrganizerListItem),
      events_created,
    });
  }

  const { data: invites, error: iErr } = await supabase
    .from('organizer_invites')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false });
  if (iErr) throw iErr;

  return {
    organizers,
    invites: (invites ?? []).map((inv) => ({
      id: inv.id as string,
      email: inv.email as string,
      role: ((inv as { role?: string }).role === 'client' ? 'client' : 'organizer') as GrantableRole,
      created_at: inv.created_at as string,
    })),
  };
}
