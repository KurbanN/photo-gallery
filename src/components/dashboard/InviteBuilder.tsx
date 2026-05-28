import InviteCard from '@/components/invite/InviteCard';
import Countdown from '@/components/invite/Countdown';
import type { InviteData, InviteTemplate } from '@/lib/invite-api';

type InviteDraft = {
  title: string;
  startsAt: string;
  template: InviteTemplate;
  location: string;
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
    location: draft.location,
    message: draft.message,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Название события"
        />
        <input
          type="datetime-local"
          value={draft.startsAt}
          onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
        />
        <input
          value={draft.location}
          onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Адрес"
        />
        <textarea
          value={draft.message}
          onChange={(e) => setDraft({ ...draft, message: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-line/70 bg-paper px-3 py-2"
          placeholder="Сообщение"
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
    location: invite?.location || '',
    message: invite?.message || '',
  };
}
