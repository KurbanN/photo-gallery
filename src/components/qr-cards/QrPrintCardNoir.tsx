import { forwardRef } from 'react';
import { normalizeQrPrintFormat, scalePx, scaleWidthPx } from '@/lib/qr-print-formats';
import { PinBlock, PrintShell, QrBlock, QrCardFooter } from './QrCardShared';
import type { QrCardLayoutProps } from './types';

const GOLD = '#c4a962';
const INK = '#141414';
const CREAM = '#f5f0e8';

const QrPrintCardNoir = forwardRef<HTMLDivElement, QrCardLayoutProps>(function QrPrintCardNoir(
  {
    guestUrl,
    pin,
    brandName = 'Allmemories',
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
  const inset = sw(32);

  return (
    <PrintShell ref={ref} format={format} exportBg={INK} className="text-[#f5f0e8]" style={{ backgroundColor: INK }}>
      <div
        className="pointer-events-none absolute border border-[#c4a962]/35"
        style={{ inset }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute border border-[#c4a962]/12"
        style={{ inset: inset + sw(8) }}
        aria-hidden
      />

      <div
        className="relative z-10 flex h-full flex-col items-center"
        style={{
          paddingLeft: sw(72),
          paddingRight: sw(72),
          paddingTop: s(84),
          paddingBottom: s(64),
        }}
      >
        <p
          className="text-center uppercase tracking-[0.5em]"
          style={{ fontSize: s(20), color: GOLD, marginBottom: s(32) }}
        >
          {brandName}
        </p>

        <h1
          className="max-w-full text-center leading-[1.12]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: s(66),
            fontWeight: 500,
            color: CREAM,
            marginBottom: s(16),
          }}
        >
          {headline}
        </h1>

        <p
          className="text-center leading-relaxed text-[#a8a29a]"
          style={{ fontSize: s(25), marginBottom: s(40), maxWidth: sw(760) }}
        >
          {subtitle}
        </p>

        <QrBlock
          qrSrc={qrSrc}
          size={qrDisplaySize}
          frameClassName="border border-[#c4a962]/40 shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
        />

        <p
          className="text-center uppercase tracking-[0.28em]"
          style={{ fontSize: s(18), color: GOLD, marginTop: s(32), marginBottom: s(32) }}
        >
          Отсканируйте камерой телефона
        </p>

        {showPin ? (
          <PinBlock
            pin={pin!}
            format={format}
            frameClassName="border border-[#c4a962]/30 bg-[#1c1c1c]"
            labelClassName="text-[#c4a962]"
            codeClassName="text-[#f5f0e8]"
            hintClassName="text-[#a8a29a]"
          />
        ) : (
          <p className="text-center text-[#a8a29a]" style={{ fontSize: s(23), marginBottom: s(24) }}>
            После сканирования загрузите фото с телефона
          </p>
        )}

        <QrCardFooter
          showPin={showPin}
          guestUrl={guestUrl}
          format={format}
          borderClassName="border-[#c4a962]/20"
          textClassName="text-[#a8a29a]"
          urlClassName="text-[#c4a962]/60"
        />
      </div>
    </PrintShell>
  );
});

export default QrPrintCardNoir;
