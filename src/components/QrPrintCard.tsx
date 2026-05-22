import { forwardRef, useEffect, useState } from 'react';
import { qrDataUrl } from '@/lib/qr-data-url';

/** Размер макета под экспорт (≈ A6 при pixelRatio 3). */
export const QR_CARD_WIDTH_PX = 1050;
export const QR_CARD_HEIGHT_PX = 1485;

export type QrPrintCardProps = {
  guestUrl: string;
  eventTitle: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  pin?: string;
  pinEnabled?: boolean;
  brandName?: string;
};

const QrPrintCard = forwardRef<HTMLDivElement, QrPrintCardProps>(function QrPrintCard(
  {
    guestUrl,
    eventTitle,
    welcomeTitle,
    welcomeSubtitle,
    pin,
    pinEnabled = true,
    brandName = 'All Memories',
  },
  ref,
) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const headline = (welcomeTitle || eventTitle).trim();
  const subtitle = welcomeSubtitle?.trim() || 'Сканируйте и делитесь фотографиями';
  const showPin = pinEnabled && Boolean(pin?.trim());

  useEffect(() => {
    let cancelled = false;
    void qrDataUrl(guestUrl, 520).then((url) => {
      if (!cancelled) setQrSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [guestUrl]);

  return (
    <div
      ref={ref}
      className="qr-print-card relative overflow-hidden bg-paper text-ink"
      style={{
        width: QR_CARD_WIDTH_PX,
        height: QR_CARD_HEIGHT_PX,
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
    >
      {/* рамка */}
      <div
        className="pointer-events-none absolute inset-[28px] border border-ink/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[36px] border border-ink/10"
        aria-hidden
      />

      {/* декоративные углы */}
      <span className="pointer-events-none absolute left-[28px] top-[28px] h-10 w-10 border-l border-t border-ink/40" aria-hidden />
      <span className="pointer-events-none absolute right-[28px] top-[28px] h-10 w-10 border-r border-t border-ink/40" aria-hidden />
      <span className="pointer-events-none absolute bottom-[28px] left-[28px] h-10 w-10 border-b border-l border-ink/40" aria-hidden />
      <span className="pointer-events-none absolute bottom-[28px] right-[28px] h-10 w-10 border-b border-r border-ink/40" aria-hidden />

      <div className="relative z-10 flex h-full flex-col items-center px-[72px] pt-[80px] pb-[64px]">
        <p
          className="mb-6 text-center uppercase tracking-[0.45em] text-muted"
          style={{ fontSize: 22, letterSpacing: '0.45em' }}
        >
          {brandName}
        </p>

        <h1
          className="mb-4 max-w-full text-center leading-[1.15] text-ink"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 64,
            fontWeight: 500,
          }}
        >
          {headline}
        </h1>

        <p
          className="mb-10 max-w-[780px] text-center leading-relaxed text-muted"
          style={{ fontSize: 26 }}
        >
          {subtitle}
        </p>

        <div className="mb-8 flex items-center justify-center border border-line bg-white p-5 shadow-[0_8px_32px_rgba(10,10,10,0.06)]">
          {qrSrc ? (
            <img src={qrSrc} alt="" width={400} height={400} className="block" />
          ) : (
            <div
              className="animate-pulse bg-line"
              style={{ width: 400, height: 400 }}
              aria-hidden
            />
          )}
        </div>

        <p
          className="mb-8 text-center uppercase tracking-[0.28em] text-muted"
          style={{ fontSize: 20 }}
        >
          Отсканируйте камерой телефона
        </p>

        {showPin ? (
          <div className="mb-6 w-full max-w-[720px] border border-ink/15 bg-white/80 px-10 py-8 text-center">
            <p
              className="mb-3 uppercase tracking-[0.35em] text-muted"
              style={{ fontSize: 18 }}
            >
              Код мероприятия
            </p>
            <p
              className="font-semibold tracking-[0.42em] text-ink"
              style={{ fontSize: 56, letterSpacing: '0.42em' }}
            >
              {pin!.trim()}
            </p>
            <p className="mt-4 text-muted" style={{ fontSize: 22 }}>
              Введите код после сканирования
            </p>
          </div>
        ) : (
          <p className="mb-6 text-center text-muted" style={{ fontSize: 24 }}>
            После сканирования загрузите фото с телефона
          </p>
        )}

        <div className="mt-auto w-full border-t border-line/80 pt-8 text-center">
          <p className="text-muted" style={{ fontSize: 18 }}>
            {showPin ? '1. Сканируйте QR · 2. Введите код · 3. Загрузите фото' : 'Сканируйте QR и загрузите фото'}
          </p>
          <p
            className="mt-3 break-all text-ink/50"
            style={{ fontSize: 16, wordBreak: 'break-all' }}
          >
            {guestUrl.replace(/^https?:\/\//, '')}
          </p>
        </div>
      </div>
    </div>
  );
});

export default QrPrintCard;
