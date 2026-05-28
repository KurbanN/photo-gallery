import type { InviteData } from '@/lib/invite-api';
import { INVITARIUM_DEFAULT } from './config';

export type InvitariumContent = {
  nameTop: string;
  nameBottom: string;
  dateDay: string;
  dateYear: string;
  intro: string;
  message: string;
};

function splitNames(title: string): { top: string; bottom: string } {
  const parts = title.split(/\s*&\s*|\s+и\s+|\s+and\s+/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { top: parts[0], bottom: parts[1] };
  return { top: title.trim(), bottom: '' };
}

function parseDate(dateIso: string | null): { day: string; year: string } {
  if (!dateIso) return { day: '', year: '' };
  const d = new Date(dateIso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return { day: `${dd}.${mm}`, year: String(d.getUTCFullYear()) };
}

export function mapInvitariumContent(invite: InviteData): InvitariumContent {
  const { top, bottom } = splitNames(invite.title || INVITARIUM_DEFAULT.title);
  const { day, year } = parseDate(invite.date);
  const intro = (invite.label || INVITARIUM_DEFAULT.label).replace(/\\n/g, '\n').trim();

  return {
    nameTop: top,
    nameBottom: bottom,
    dateDay: day,
    dateYear: year,
    intro,
    message: invite.message || INVITARIUM_DEFAULT.message,
  };
}

export function mapsHref(invite: InviteData): string {
  if (invite.mapUrl?.trim()) return invite.mapUrl.trim();
  const q = [invite.venueName, invite.location, invite.city].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
