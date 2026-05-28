import InviteCard from '@/components/invite/InviteCard';
import Countdown from '@/components/invite/Countdown';
import type { InviteData, InviteTemplate } from '@/lib/invite-api';

type InviteDraft = {
  title: string;
  startsAt: string;
  template: InviteTemplate;
  label: string;
  quote: string;
  venueName: string;
  location: string;
  city: string;
  mapUrl: string;
  message: string;
};

export default function InviteBuilder({
  draft,
  setDraft,
  onSave,
  saving,
  inviteUrl,
  previewSlug,
}: {
  draft: InviteDraft;
  setDraft: (next: InviteDraft) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  inviteUrl: string;
  previewSlug: string;
}) {
  const previewInvite: InviteData = {
    eventId: 'preview',
    slug: previewSlug || 'preview',
    title: draft.title || 'Название мероприятия',
    date: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
    template: draft.template,
    label: draft.label || 'Wedding Day',
    quote: draft.quote || 'С этого дня — навсегда.',
    venueName: draft.venueName,
    location: draft.location,
    city: draft.city,
    mapUrl: draft.mapUrl,
    message: draft.message,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Имена пары (напр. Kurban & Fatima)"
        />
        <input
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Верхняя подпись (напр. Wedding Day)"
        />
        <input
          type="datetime-local"
          value={draft.startsAt}
          onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
        />
        <input
          value={draft.venueName}
          onChange={(e) => setDraft({ ...draft, venueName: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Площадка / ресторан"
        />
        <input
          value={draft.location}
          onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Адрес (улица, дом)"
        />
        <input
          value={draft.city}
          onChange={(e) => setDraft({ ...draft, city: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Город"
        />
        <input
          value={draft.mapUrl}
          onChange={(e) => setDraft({ ...draft, mapUrl: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Ссылка на карту (необязательно)"
        />
        <textarea
          value={draft.message}
          onChange={(e) => setDraft({ ...draft, message: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Текст приглашения"
        />
        <textarea
          value={draft.quote}
          onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Цитата (напр. С этого дня — навсегда.)"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDraft({ ...draft, template: 'classic' })}
            className={`rounded-full px-3 py-1 text-xs ${draft.template === 'classic' ? 'bg-ink text-paper' : 'border border-line'}`}
          >
            Classic
          </button>
          <button
            type="button"
            onClick={() => setDraft({ ...draft, template: 'dark' })}
            className={`rounded-full px-3 py-1 text-xs ${draft.template === 'dark' ? 'bg-ink text-paper' : 'border border-line'}`}
          >
            Dark
          </button>
        </div>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          className="w-full rounded-full bg-ink px-4 py-2 text-xs uppercase tracking-[0.12em] text-paper"
        >
          {saving ? 'Сохранение...' : 'Сохранить invite'}
        </button>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl border border-line/60 bg-paper p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Ссылка</p>
          <p className="mt-1 break-all text-sm">{inviteUrl}</p>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted">Живое превью</p>
          <InviteCard invite={previewInvite}>
            <Countdown targetIso={previewInvite.date} />
          </InviteCard>
        </div>
      </div>
    </div>
  );
}

export function toDraft(invite: InviteData | null): InviteDraft {
  const dt = invite?.date ? new Date(invite.date) : null;
  const startsAt = dt
    ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
        dt.getDate(),
      ).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
    : '';
  return {
    title: invite?.title || '',
    startsAt,
    template: invite?.template || 'classic',
    label: invite?.label || 'Wedding Day',
    quote: invite?.quote || 'С этого дня — навсегда.',
    venueName: invite?.venueName || '',
    location: invite?.location || '',
    city: invite?.city || '',
    mapUrl: invite?.mapUrl || '',
    message: invite?.message || '',
  };
}
