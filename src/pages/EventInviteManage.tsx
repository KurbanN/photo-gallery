import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import InviteBuilder, { toDraft } from '@/components/dashboard/InviteBuilder';
import RSVPTable from '@/components/dashboard/RSVPTable';
import {
  createRSVPSubscription,
  fetchInviteManageData,
  saveInvite,
  type InviteData,
  type RSVPResponse,
} from '@/lib/invite-api';

export default function EventInviteManage() {
  const { id = '' } = useParams<{ id: string }>();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [rows, setRows] = useState<RSVPResponse[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const draft = useMemo(() => toDraft(invite), [invite]);
  const [draftState, setDraftState] = useState(draft);

  useEffect(() => setDraftState(draft), [draft]);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const data = await fetchInviteManageData(id);
        setInvite(data.invite);
        setRows(data.responses);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const counters = useMemo(
    () => ({
      total: rows.length,
      attending: rows.filter((x) => x.status === 'attending').length,
      maybe: rows.filter((x) => x.status === 'maybe').length,
      declined: rows.filter((x) => x.status === 'declined').length,
    }),
    [rows],
  );

  const inviteUrl = invite ? `${window.location.origin}${import.meta.env.BASE_URL}invite/${invite.slug}` : '';
  const previewSlug = invite?.slug || '';

  useEffect(() => {
    if (!id) return;
    const channel = createRSVPSubscription(id, async () => {
      try {
        const data = await fetchInviteManageData(id);
        setRows(data.responses);
      } catch {
        // Avoid noisy UI errors from transient realtime reconnects.
      }
    });
    return () => {
      void channel.unsubscribe();
    };
  }, [id]);

  if (loading) return <div className="p-6">Загрузка...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl">Invite + RSVP</h1>
        <Link to={`/dashboard/events/${id}`} className="text-sm underline">
          Назад к мероприятию
        </Link>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <InviteBuilder
        draft={draftState}
        setDraft={setDraftState}
        saving={saving}
        inviteUrl={inviteUrl}
        previewSlug={previewSlug}
        onSave={async () => {
          setSaving(true);
          setMsg('');
          try {
            const next = await saveInvite(id, {
              title: draftState.title,
              startsAt: draftState.startsAt ? new Date(draftState.startsAt).toISOString() : null,
              template: draftState.template,
              label: draftState.label,
              quote: draftState.quote,
              venueName: draftState.venueName,
              location: draftState.location,
              city: draftState.city,
              mapUrl: draftState.mapUrl,
              message: draftState.message,
            });
            setInvite(next);
            setMsg('Сохранено');
          } catch (e) {
            setMsg(e instanceof Error ? e.message : 'Ошибка');
          } finally {
            setSaving(false);
          }
        }}
      />

      {msg ? <p className="text-sm text-muted">{msg}</p> : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat title="Всего" value={counters.total} />
        <Stat title="Придут" value={counters.attending} />
        <Stat title="Не придут" value={counters.declined} />
        <Stat title="Под вопросом" value={counters.maybe} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.12em]"
          onClick={async () => {
            await navigator.clipboard.writeText(inviteUrl);
            setMsg('Ссылка скопирована');
          }}
        >
          Скопировать ссылку
        </button>
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.12em]"
          onClick={() => exportCsv(rows)}
        >
          Экспорт CSV
        </button>
      </div>

      <RSVPTable rows={rows} />
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-line/60 bg-paper p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function exportCsv(rows: RSVPResponse[]) {
  const header = ['name', 'status', 'comment', 'created_at'];
  const lines = rows.map((r) =>
    [r.name, r.status, r.comment || '', r.created_at]
      .map((x) => `"${String(x).replaceAll('"', '""')}"`)
      .join(','),
  );
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rsvp.csv';
  a.click();
  URL.revokeObjectURL(url);
}
