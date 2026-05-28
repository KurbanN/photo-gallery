import type { InviteData } from '@/lib/invite-api';
import type { ReactNode } from 'react';

export default function InviteCard({ invite, children }: { invite: InviteData; children?: ReactNode }) {
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
    <section className={`w-full rounded-2xl border p-6 shadow-sm sm:p-8 ${container}`}>
      <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{invite.title}</h1>
      <div className={`mt-6 space-y-2 border-l-2 pl-4 ${accent}`}>
        <p className="text-lg font-medium">{formattedDate}</p>
        {formattedTime ? <p className="text-base">{formattedTime}</p> : null}
      </div>
      {invite.location ? (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.18em] opacity-70">Место</p>
          <p className="mt-2 text-base">{invite.location}</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invite.location)}`}
            target="_blank"
            rel="noreferrer"
            className={`mt-2 inline-block text-sm underline underline-offset-4 ${accent}`}
          >
            Открыть в картах
          </a>
        </div>
      ) : null}
      {invite.message ? <p className="mt-6 text-base leading-relaxed opacity-90">{invite.message}</p> : null}
      <div className="mt-8">{children}</div>
      <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] opacity-60">Allmemories</p>
    </section>
  );
}
