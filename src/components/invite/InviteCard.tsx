import type { InviteData } from '@/lib/invite-api';
import type { ReactNode } from 'react';
import InvitariumTemplate, { type InvitariumRsvpProps } from './templates/InvitariumTemplate';

function ClassicInviteCard({ invite, children }: { invite: InviteData; children?: ReactNode }) {
  const dark = invite.template === 'dark';
  const container = dark
    ? 'bg-[#1A1814] text-[#F5F3EE] border-[#3b3428]'
    : 'bg-[#FAFAF7] text-[#2C2C2A] border-[#d7c7ad]';
  const accent = 'text-[#C9A96E]';
  const date = invite.date ? new Date(invite.date) : null;
  const formattedDate = date
    ? date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Дата уточняется';
  const formattedTime = date
    ? date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <section className={`invite-card w-full rounded-2xl border p-6 shadow-sm sm:p-8 ${container} animate-in fade-in duration-500`}>
      <p className="text-center text-xs uppercase tracking-[0.28em] opacity-70">{invite.label || 'Wedding Day'}</p>
      <h1 className="mt-3 text-center font-serif text-4xl leading-tight sm:text-5xl">{invite.title}</h1>
      <p className={`mt-4 text-center text-lg ${accent}`}>{formattedDate}</p>
      {formattedTime ? <p className="text-center text-sm uppercase tracking-[0.2em] opacity-70">{formattedTime}</p> : null}

      <div className="mt-8 border-t border-b border-line/40 py-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">Дорогие родные и друзья</p>
        {invite.message ? <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed">{invite.message}</p> : null}
        {invite.quote ? <p className={`mt-4 font-serif text-xl italic ${accent}`}>{invite.quote}</p> : null}
      </div>

      <div className="mt-6 rounded-xl border border-line/40 p-4">
        <p className="text-xs uppercase tracking-[0.2em] opacity-70">Где и когда</p>
        {invite.venueName ? <p className="mt-2 font-serif text-2xl">{invite.venueName}</p> : null}
        {invite.location ? <p className="mt-1 text-base">{invite.location}</p> : null}
        {invite.city ? <p className="mt-1 text-sm uppercase tracking-[0.14em] opacity-70">{invite.city}</p> : null}
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href={
              invite.mapUrl?.trim()
                ? invite.mapUrl
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [invite.venueName, invite.location, invite.city].filter(Boolean).join(' '),
                  )}`
            }
            target="_blank"
            rel="noreferrer"
            className={`text-sm underline underline-offset-4 ${accent}`}
          >
            Открыть в картах
          </a>
        </div>
      </div>
      <div className="mt-8">{children}</div>
      <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] opacity-60">Allmemories</p>
    </section>
  );
}

export default function InviteCard({
  invite,
  children,
  invitariumRsvp,
}: {
  invite: InviteData;
  children?: ReactNode;
  invitariumRsvp?: InvitariumRsvpProps;
}) {
  if (invite.template === 'invitarium') {
    return <InvitariumTemplate invite={invite} rsvp={invitariumRsvp} />;
  }
  return <ClassicInviteCard invite={invite}>{children}</ClassicInviteCard>;
}
