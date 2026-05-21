type Props = {
  bgUrl: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  pinRequired?: boolean;
  className?: string;
};

/** Миниатюра экрана входа гостя (как на /e/:slug). */
export default function GuestLoginPreview({
  bgUrl,
  welcomeTitle,
  welcomeSubtitle,
  pinRequired = true,
  className = '',
}: Props) {
  return (
    <div
      className={`relative overflow-hidden border border-line bg-paper ${className}`}
      style={{ aspectRatio: '9 / 16', maxHeight: '420px' }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${bgUrl})` }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper/88 via-paper/78 to-paper/90 backdrop-blur-[2px]" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-8">
        <p className="mb-1 text-center font-serif text-lg text-ink leading-tight">{welcomeTitle || 'Название'}</p>
        <p className="mb-6 max-w-[220px] text-center text-[11px] leading-relaxed text-muted">
          {welcomeSubtitle || 'Подзаголовок для гостей'}
        </p>
        <div className="w-full max-w-[200px] space-y-3">
          {pinRequired && (
            <>
              <p className="text-center text-[9px] uppercase tracking-[0.2em] text-muted">Код мероприятия</p>
              <div className="h-9 border border-line/90 bg-white/95 shadow-sm" />
            </>
          )}
          <div className="h-9 bg-ink" />
        </div>
      </div>
    </div>
  );
}
