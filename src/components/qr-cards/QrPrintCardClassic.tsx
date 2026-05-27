import { forwardRef } from 'react';
import { BotanicalWreath, CardShell, PinBlock, QrBlock, QrCardFooter } from './QrCardShared';
import type { QrCardLayoutProps } from './types';

const QrPrintCardClassic = forwardRef<HTMLDivElement, QrCardLayoutProps>(function QrPrintCardClassic(
  {
    guestUrl,
    pin,
    brandName = 'Allmemories',
    bgUrl = null,
    qrSrc,
    headline,
    subtitle,
    showPin,
  },
  ref,
) {
  return (
    <CardShell ref={ref} exportBg="#faf9f7" className="bg-paper text-ink">
      {bgUrl ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${bgUrl})` }}
          aria-hidden
        />
      ) : null}
      <div
        className={`pointer-events-none absolute inset-0 ${
          bgUrl ? 'bg-gradient-to-b from-paper/88 via-paper/78 to-paper/90' : ''
        }`}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-[28px] border border-ink/25" aria-hidden />
      <div className="pointer-events-none absolute inset-[36px] border border-ink/10" aria-hidden />
      <span className="pointer-events-none absolute left-[28px] top-[28px] h-10 w-10 border-l border-t border-ink/40" aria-hidden />
      <span className="pointer-events-none absolute right-[28px] top-[28px] h-10 w-10 border-r border-t border-ink/40" aria-hidden />
      <span className="pointer-events-none absolute bottom-[28px] left-[28px] h-10 w-10 border-b border-l border-ink/40" aria-hidden />
      <span className="pointer-events-none absolute bottom-[28px] right-[28px] h-10 w-10 border-b border-r border-ink/40" aria-hidden />

      <div className="relative z-10 flex h-full flex-col items-center px-[72px] pt-[80px] pb-[64px]">
        <p className="mb-6 text-center uppercase tracking-[0.45em] text-muted" style={{ fontSize: 22 }}>
          {brandName}
        </p>

        <h1
          className="mb-4 max-w-full text-center leading-[1.15] text-ink"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 500 }}
        >
          {headline}
        </h1>

        <p className="mb-10 max-w-[780px] text-center leading-relaxed text-muted" style={{ fontSize: 26 }}>
          {subtitle}
        </p>

        <QrBlock qrSrc={qrSrc} frameClassName="border border-line shadow-[0_8px_32px_rgba(10,10,10,0.06)]" />

        <p className="mb-8 mt-8 text-center uppercase tracking-[0.28em] text-muted" style={{ fontSize: 20 }}>
          Отсканируйте камерой телефона
        </p>

        {showPin ? (
          <PinBlock pin={pin!} />
        ) : (
          <p className="mb-6 text-center text-muted" style={{ fontSize: 24 }}>
            После сканирования загрузите фото с телефона
          </p>
        )}

        <QrCardFooter showPin={showPin} guestUrl={guestUrl} />
      </div>
    </CardShell>
  );
});

export default QrPrintCardClassic;
