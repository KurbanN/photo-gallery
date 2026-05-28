import type { InviteData } from '@/lib/invite-api';
import { INVITARIUM_DEFAULT } from './config';
import { MAKET12_TEXT } from './maket12Texts';
import { mapInvitariumContent } from './mapInviteContent';
import {
  invitariumFormPageUrl,
  invitariumTimerPageUrl,
  rewriteInviteAssetPaths,
} from './paths';

function escapeCanvaFragment(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n');
}

/** Замена одного текстового блока Canva: "A":"…\\n" */
function replaceCanvaText(html: string, oldText: string, newText: string): string {
  if (oldText === newText) return html;
  const from = `"A":"${escapeCanvaFragment(oldText)}\\\\n"`;
  const to = `"A":"${escapeCanvaFragment(newText)}\\\\n"`;
  if (!html.includes(from)) return html;
  return html.split(from).join(to);
}

function splitNames(title: string): { top: string; bottom: string } {
  const parts = title.split(/\s*&\s*|\s+и\s+|\s+and\s+/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { top: parts[0], bottom: parts[1] };
  return { top: title.trim(), bottom: '' };
}

function splitLabel(label: string): { line1: string; line2: string } {
  const normalized = label.replace(/\\n/g, '\n').trim();
  const idx = normalized.indexOf('\n');
  if (idx === -1) return { line1: normalized, line2: '' };
  return {
    line1: normalized.slice(0, idx).trim(),
    line2: normalized.slice(idx + 1).trim(),
  };
}

function splitQuote(quote: string): { intro: string; host: string } {
  const normalized = quote.replace(/\\n/g, '\n').trim();
  const idx = normalized.indexOf('\n');
  if (idx === -1) return { intro: normalized, host: '' };
  return {
    intro: normalized.slice(0, idx).trim(),
    host: normalized.slice(idx + 1).trim(),
  };
}

function formatVenue(invite: InviteData): string {
  const venue = invite.venueName?.trim() || INVITARIUM_DEFAULT.venueName;
  const location = invite.location?.trim() || INVITARIUM_DEFAULT.location;
  const city = invite.city?.trim();
  const line1 = [venue, location].filter(Boolean).join(' ');
  if (city && !location.includes(city)) return `${line1} \n${city}`;
  return line1 || MAKET12_TEXT.venue;
}

function formatTime(dateIso: string | null): string | null {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  if (h === '00' && m === '00') return null;
  return `B  ${h}:${m}`;
}

export type Maket12TextPatch = { from: string; to: string };

export function buildMaket12TextPatches(invite: InviteData): Maket12TextPatch[] {
  const content = mapInvitariumContent(invite);
  const names = splitNames(invite.title || INVITARIUM_DEFAULT.title);
  const label = splitLabel(invite.label || INVITARIUM_DEFAULT.label);
  const quote = splitQuote(invite.quote || INVITARIUM_DEFAULT.quote);
  const venue = formatVenue(invite);
  const time = formatTime(invite.date);

  const patches: Maket12TextPatch[] = [
    { from: MAKET12_TEXT.nameTop, to: names.top || MAKET12_TEXT.nameTop },
    { from: MAKET12_TEXT.nameBottom, to: names.bottom || MAKET12_TEXT.nameBottom },
    { from: MAKET12_TEXT.dateFull, to: content.dateDay && content.dateYear ? `${content.dateDay}.${content.dateYear}` : MAKET12_TEXT.dateFull },
    { from: MAKET12_TEXT.dateDay, to: content.dateDay || MAKET12_TEXT.dateDay },
    { from: MAKET12_TEXT.dateYear, to: content.dateYear || MAKET12_TEXT.dateYear },
    { from: MAKET12_TEXT.labelLine1, to: label.line1 || MAKET12_TEXT.labelLine1 },
    { from: MAKET12_TEXT.labelLine2, to: label.line2 || MAKET12_TEXT.labelLine2 },
    { from: MAKET12_TEXT.message, to: invite.message || INVITARIUM_DEFAULT.message },
    { from: MAKET12_TEXT.quoteIntro, to: quote.intro || MAKET12_TEXT.quoteIntro },
    { from: MAKET12_TEXT.venue, to: venue },
    { from: MAKET12_TEXT.countdownTitle, to: INVITARIUM_DEFAULT.countdownTitle },
  ];

  if (quote.host) {
    patches.push({ from: MAKET12_TEXT.quoteHost, to: quote.host });
  }
  if (time) {
    patches.push({ from: MAKET12_TEXT.time, to: time });
  }

  return patches
    .filter((p) => p.from !== p.to)
    .sort((a, b) => b.from.length - a.from.length);
}

/** Патчит HTML Canva-export: тексты, embed Invitarium, дата таймера. */
export function patchMaket12Html(html: string, invite: InviteData): string {
  let out = html;

  const timer = invitariumTimerPageUrl(invite.date);
  const form = invitariumFormPageUrl();

  out = out.replaceAll('https://invitarium.io/t/6e950298a33c648472', timer);
  out = out.replaceAll('https://invitarium.io/f/eb5daa0293f020daa2', form);
  out = out.replaceAll('/invite-assets/invitarium-pages/t/6e950298a33c648472.html', timer);
  out = out.replaceAll('/invite-assets/invitarium-pages/f/eb5daa0293f020daa2.html', form);

  for (const { from, to } of buildMaket12TextPatches(invite)) {
    out = replaceCanvaText(out, from, to);
  }

  return rewriteInviteAssetPaths(out);
}
