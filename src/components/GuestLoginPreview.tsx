import { Lock } from 'lucide-react';

type Props = {
  bgUrl: string | null;
  welcomeTitle: string;
  welcomeSubtitle: string;
  pinRequired?: boolean;
  pinPreview?: string;
  className?: string;
};

/** Миниатюра экрана входа гостя (как на /e/:slug). */
export default function GuestLoginPreview({
  bgUrl,
  welcomeTitle,
  welcomeSubtitle,
  pinRequired = true,
  pinPreview = '••••',
  className = '',
}: Props) {
  const digits = pinPreview.padEnd(4, ' ').slice(0, 4).split('');

  return (
    <div
      className={`relative overflow-hidden border border-line ${className}`}
      style={{ aspectRatio: '9 / 16', maxHeight: '440px' }}
    >
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

      <div className="relative z-10 flex h-full flex-col px-3 py-6">
        <p className="text-center text-[8px] font-semibold uppercase tracking-[0.3em] text-white/85">
          {welcomeTitle || 'Название'}
        </p>

        <div className="flex flex-1 flex-col items-center justify-center">
          <Lock className="mb-3 h-7 w-7 text-white/90" strokeWidth={1.25} />
          <p className="mb-2 text-center font-serif text-base text-white">Это закрытый альбом</p>
          <p className="mb-5 max-w-[200px] text-center text-[9px] leading-relaxed text-white/75">
            {welcomeSubtitle || 'Введите код с карточки на столе…'}
          </p>
          {pinRequired && (
            <div className="flex justify-center gap-1.5">
              {digits.map((d, i) => (
                <span
                  key={i}
                  className="flex h-9 w-8 items-center justify-center border border-white/35 bg-black/25 text-sm text-white"
                >
                  {d.trim() || ''}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto mb-2 h-8 w-full max-w-[180px] rounded-full bg-ink" />
      </div>
    </div>
  );
}
