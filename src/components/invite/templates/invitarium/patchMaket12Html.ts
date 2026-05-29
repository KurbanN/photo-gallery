import type { InviteData } from '@/lib/invite-api';
import { INVITARIUM_DEFAULT } from './config';
import { MAKET12_TEXT } from './maket12Texts';
import { mapInvitariumContent } from './mapInviteContent';
import {
  invitariumFormPageUrl,
  invitariumTimerPageUrl,
  maket12ShellBase,
  rewriteInviteAssetPaths,
} from './paths';
import { replaceCanvaInBootstrap, type ReplaceCanvaOptions } from './replaceCanvaBootstrap';

function replaceCanvaText(
  html: string,
  oldText: string,
  newText: string,
  options?: ReplaceCanvaOptions,
): string {
  return replaceCanvaInBootstrap(html, oldText, newText, options);
}

/** Имена: в макете по 2 слоя (основной + копия); патчим только первый, второй скрываем. */
function applyMaket12NamePatches(html: string, invite: InviteData): string {
  const names = splitNames(invite.title || INVITARIUM_DEFAULT.title);
  const top = names.top || MAKET12_TEXT.nameTop;
  const bottom = names.bottom.trim() ? names.bottom : ' ';

  let out = html;

  out = replaceCanvaText(out, MAKET12_TEXT.nameTop, ' ', { occurrence: 2 });
  out = replaceCanvaText(out, MAKET12_TEXT.nameBottom, ' ', { occurrence: 2 });

  out = replaceCanvaText(out, MAKET12_TEXT.nameTop, top, { occurrence: 1 });
  out = replaceCanvaText(out, MAKET12_TEXT.nameBottom, bottom, { occurrence: 1 });

  if (bottom.trim() || top !== MAKET12_TEXT.nameTop) {
    const from = `"font-size":{"B":"${MAKET12_TEXT.nameBottomFontSize}"}`;
    const to = `"font-size":{"B":"${MAKET12_TEXT.nameTopFontSize}"}`;
    if (out.includes(from)) out = out.split(from).join(to);
  }

  return out;
}

function splitNames(title: string): { top: string; bottom: string } {
  const parts = title.split(/\s*&\s*|\s+и\s+|\s+and\s+/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { top: parts[0], bottom: parts[1] };
  return { top: title.trim(), bottom: '' };
}

function splitLabel(label: string): { line1: string; line2: string; singleLine: boolean } {
  const normalized = label.replace(/\\n/g, '\n').trim();
  const idx = normalized.indexOf('\n');
  if (idx === -1) return { line1: normalized, line2: '', singleLine: true };
  return {
    line1: normalized.slice(0, idx).trim(),
    line2: normalized.slice(idx + 1).trim(),
    singleLine: false,
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
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  if (h === '00' && m === '00') return null;
  return `B  ${h}:${m}`;
}

export type Maket12TextPatch = { from: string; to: string };

export function buildMaket12TextPatches(invite: InviteData): Maket12TextPatch[] {
  const content = mapInvitariumContent(invite);
  const label = splitLabel(invite.label || INVITARIUM_DEFAULT.label);
  const quote = splitQuote(invite.quote || INVITARIUM_DEFAULT.quote);
  const venue = formatVenue(invite);
  const time = formatTime(invite.date);

  const patches: Maket12TextPatch[] = [
    { from: MAKET12_TEXT.dateFull, to: content.dateDay && content.dateYear ? `${content.dateDay}.${content.dateYear}` : MAKET12_TEXT.dateFull },
    { from: MAKET12_TEXT.dateDay, to: content.dateDay || MAKET12_TEXT.dateDay },
    { from: MAKET12_TEXT.dateYear, to: content.dateYear || MAKET12_TEXT.dateYear },
    ...(label.singleLine
      ? [
          { from: MAKET12_TEXT.labelLine1, to: label.line1 },
          { from: MAKET12_TEXT.labelLine2, to: ' ' },
        ]
      : [
          { from: MAKET12_TEXT.labelLine1, to: label.line1 || MAKET12_TEXT.labelLine1 },
          { from: MAKET12_TEXT.labelLine2, to: label.line2 || MAKET12_TEXT.labelLine2 },
        ]),
    {
      from: MAKET12_TEXT.message,
      to: (invite.message || INVITARIUM_DEFAULT.message).replace(/\\n/g, '\n'),
    },
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

const TIMER_ID = '6e950298a33c648472';

/** Все варианты ссылки на таймер в Canva-export (в т.ч. URL-encoded в canva-embed). */
function replaceTimerEmbedUrls(html: string, timerRel: string, timerAbs: string): string {
  let out = html;
  const legacy = [
    `https://invitarium.io/t/${TIMER_ID}`,
    `/invite-assets/invitarium-pages/t/${TIMER_ID}.html`,
  ];
  for (const from of legacy) {
    out = out.split(from).join(timerRel);
  }
  const encodedLegacy = [
    encodeURIComponent(`https://invitarium.io/t/${TIMER_ID}`),
    encodeURIComponent(`https://invitarium.io/t/${TIMER_ID}/`),
  ];
  const encodedTimer = encodeURIComponent(timerAbs);
  for (const from of encodedLegacy) {
    out = out.split(from).join(encodedTimer);
  }
  return out;
}

function injectMaket12TimerConfig(html: string, timerAbs: string): string {
  const snippet = `<script>window.__MAKET12_TIMER_URL__=${JSON.stringify(timerAbs)};</script>`;
  if (html.includes('host.js"></script>')) {
    return html.replace('host.js"></script>', `host.js"></script>${snippet}`);
  }
  return html.replace('<head>', `<head>${snippet}`);
}

/** Патчит HTML Canva-export: тексты, embed Invitarium, дата таймера. */
export function patchMaket12Html(html: string, invite: InviteData): string {
  let out = html;

  const timerRel = invitariumTimerPageUrl(invite.date);
  const timerAbs = invitariumTimerPageUrl(invite.date, { absolute: true });
  const form = invitariumFormPageUrl();

  out = replaceTimerEmbedUrls(out, timerRel, timerAbs);
  out = out.replaceAll('https://invitarium.io/f/eb5daa0293f020daa2', form);
  out = out.replaceAll('/invite-assets/invitarium-pages/f/eb5daa0293f020daa2.html', form);
  out = injectMaket12TimerConfig(out, timerAbs);

  out = applyMaket12NamePatches(out, invite);

  for (const { from, to } of buildMaket12TextPatches(invite)) {
    out = replaceCanvaText(out, from, to);
  }

  out = rewriteInviteAssetPaths(out);

  const shellBase = maket12ShellBase();
  out = out.replace(/<base href="[^"]*">/, `<base href="${shellBase}">`);

  return out;
}
