import { useMemo, useState } from 'react';
import type { RSVPStatus } from '@/lib/invite-api';

const STATUS_OPTIONS: { id: RSVPStatus; label: string; emoji: string }[] = [
  { id: 'attending', label: 'Да, приду', emoji: '✅' },
  { id: 'maybe', label: 'Пока не знаю', emoji: '❓' },
  { id: 'declined', label: 'Не смогу прийти', emoji: '❌' },
];

export default function RSVPForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (payload: { name: string; status: RSVPStatus; comment: string }) => Promise<void>;
}) {
  const [status, setStatus] = useState<RSVPStatus | null>(null);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const canSubmit = useMemo(() => !!status && name.trim().length > 1, [status, name]);

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.14em] opacity-70">Вы придете?</p>
      <div className="mt-3 grid gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const active = status === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatus(opt.id)}
              className={`flex w-full items-center justify-start gap-2 rounded-xl border px-4 py-3 text-left transition-all ${
                active
                  ? 'scale-[1.01] border-[#C9A96E] bg-[#C9A96E]/15'
                  : 'border-line/60 hover:border-[#C9A96E]/60 hover:bg-[#C9A96E]/5'
              }`}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {status ? (
        <form
          className="mt-4 space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            if (!status || !name.trim()) {
              setError('Укажите имя');
              return;
            }
            try {
              await onSubmit({ name, status, comment });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Ошибка отправки');
            }
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            className="w-full rounded-lg border border-line/70 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#C9A96E]"
            required
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий (необязательно)"
            rows={3}
            className="w-full rounded-lg border border-line/70 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#C9A96E]"
          />
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full rounded-full bg-[#2C2C2A] px-4 py-2 text-sm uppercase tracking-[0.12em] text-[#FAFAF7] disabled:opacity-50"
          >
            {loading ? 'Отправка...' : 'Отправить'}
          </button>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </form>
      ) : null}
    </div>
  );
}
