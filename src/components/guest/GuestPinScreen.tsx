import { Lock, Loader2 } from 'lucide-react';
import PinInput4 from './PinInput4';

type Props = {
  welcomeTitle: string;
  eventDateShort: string | null;
  bgUrl: string | null;
  pin: string;
  onPinChange: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
  description?: string;
  submitLabel?: string;
};

export default function GuestPinScreen({
  welcomeTitle,
  eventDateShort,
  bgUrl,
  pin,
  onPinChange,
  error,
  loading,
  onSubmit,
  description = 'Введите код с карточки на столе, чтобы просматривать и загружать фото с мероприятия',
  submitLabel = 'Продолжить',
}: Props) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {bgUrl ? (
        <div
          className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgUrl})` }}
          aria-hidden
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-ink" aria-hidden />
      )}
      <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden />

      <div className="relative z-10 flex flex-1 flex-col px-6 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.35em] text-white/90">
          {welcomeTitle}
        </p>
        {eventDateShort && (
          <p className="mt-1 text-center text-[10px] uppercase tracking-[0.25em] text-white/70">
            {eventDateShort}
          </p>
        )}

        <div className="flex flex-1 flex-col items-center justify-center">
          <Lock className="mb-6 h-10 w-10 text-white/90" strokeWidth={1.25} />
          <h1 className="mb-3 text-center font-serif text-3xl text-white md:text-4xl">
            Это закрытый альбом
          </h1>
          <p className="mb-10 max-w-xs text-center text-sm leading-relaxed text-white/80">{description}</p>
          <PinInput4 value={pin} onChange={onPinChange} disabled={loading} />
          {error && <p className="mt-4 text-center text-sm text-red-300">{error}</p>}
        </div>

        <button
          type="button"
          disabled={loading || pin.length < 4}
          onClick={onSubmit}
          className="mx-auto w-full max-w-sm rounded-full bg-ink py-4 text-xs font-semibold uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Проверка…
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </div>
  );
}
