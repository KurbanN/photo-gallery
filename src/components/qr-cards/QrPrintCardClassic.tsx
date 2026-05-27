import { forwardRef } from 'react';
import { normalizeQrPrintFormat, scalePx, scaleWidthPx } from '@/lib/qr-print-formats';
import { PinBlock, PrintShell, QrBlock, QrCardFooter } from './QrCardShared';
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
    format: formatProp,
    qrDisplaySize,
  },
  ref,
) {
  const format = normalizeQrPrintFormat(formatProp);
  const s = (px: number) => scalePx(px, format);
  const sw = (px: number) => scaleWidthPx(px, format);
  const inset = sw(28);
  const corner = s(40);

  return (
    <PrintShell ref={ref} format={format} exportBg="#faf9f7" className="bg-paper text-ink">
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

      <div className="pointer-events-none absolute border border-ink/25" style={{ inset }} aria-hidden />
      <div className="pointer-events-none absolute border border-ink/10" style={{ inset: inset + sw(8) }} aria-hidden />
      <span
        className="pointer-events-none absolute border-l border-t border-ink/40"
        style={{ left: inset, top: inset, width: corner, height: corner }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute border-r border-t border-ink/40"
        style={{ right: inset, top: inset, width: corner, height: corner }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute border-b border-l border-ink/40"
        style={{ bottom: inset, left: inset, width: corner, height: corner }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute border-b border-r border-ink/40"
        style={{ bottom: inset, right: inset, width: corner, height: corner }}
        aria-hidden
      />

      <div
        className="relative z-10 flex h-full flex-col items-center"
        style={{
          paddingLeft: sw(72),
          paddingRight: sw(72),
          paddingTop: s(80),
          paddingBottom: s(64),
        }}
      >
        <p className="text-center uppercase tracking-[0.45em] text-muted" style={{ fontSize: s(22), marginBottom: s(24) }}>
          {brandName}
        </p>

        <h1
          className="max-w-full text-center leading-[1.15] text-ink"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: s(64),
            fontWeight: 500,
            marginBottom: s(16),
          }}
        >
          {headline}
        </h1>

        <p
          className="text-center leading-relaxed text-muted"
          style={{ fontSize: s(26), marginBottom: s(40), maxWidth: sw(780) }}
        >
          {subtitle}
        </p>

        <QrBlock qrSrc={qrSrc} size={qrDisplaySize} frameClassName="border border-line shadow-[0_8px_32px_rgba(10,10,10,0.06)]" />

        <p
          className="text-center uppercase tracking-[0.28em] text-muted"
          style={{ fontSize: s(20), marginTop: s(32), marginBottom: s(32) }}
        >
          Отсканируйте камерой телефона
        </p>

        {showPin ? (
          <PinBlock pin={pin!} format={format} />
        ) : (
          <p className="text-center text-muted" style={{ fontSize: s(24), marginBottom: s(24) }}>
            После сканирования загрузите фото с телефона
          </p>
        )}

        <QrCardFooter showPin={showPin} guestUrl={guestUrl} format={format} />
      </div>
    </PrintShell>
  );
});

export default QrPrintCardClassic;
