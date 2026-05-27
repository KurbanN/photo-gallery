import { forwardRef } from 'react';
import { normalizeQrPrintFormat, scalePx, scaleWidthPx } from '@/lib/qr-print-formats';
import { BotanicalWreath, PinBlock, PrintShell, QrBlock, QrCardFooter } from './QrCardShared';
import type { QrCardLayoutProps } from './types';

const SAGE = '#6b7f5c';
const CREAM = '#f4f1ea';

const QrPrintCardBotanical = forwardRef<HTMLDivElement, QrCardLayoutProps>(function QrPrintCardBotanical(
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
  const inset = sw(24);

  return (
    <PrintShell ref={ref} format={format} exportBg={CREAM} className="text-ink" style={{ backgroundColor: CREAM }}>
      <div
        className="pointer-events-none absolute rounded-sm border border-[#6b7f5c]/25"
        style={{ inset }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bg-[#6b7f5c]/20"
        style={{ left: inset, right: inset, top: inset, height: 4 }}
        aria-hidden
      />

      <div
        className="relative z-10 flex h-full flex-col items-center"
        style={{
          paddingLeft: sw(76),
          paddingRight: sw(76),
          paddingTop: s(72),
          paddingBottom: s(60),
        }}
      >
        <BotanicalWreath color={SAGE} format={format} />

        <p
          className="text-center uppercase tracking-[0.42em]"
          style={{ fontSize: s(20), color: SAGE, marginBottom: s(20) }}
        >
          {brandName}
        </p>

        <h1
          className="max-w-full text-center leading-[1.12] text-ink"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: s(68),
            fontWeight: 500,
            marginBottom: s(16),
          }}
        >
          {headline}
        </h1>

        <div className="flex items-center gap-3" style={{ marginBottom: s(32) }} aria-hidden>
          <span className="bg-[#6b7f5c]/35" style={{ height: 1, width: sw(48) }} />
          <span className="rounded-full bg-[#6b7f5c]/50" style={{ height: s(6), width: s(6) }} />
          <span className="bg-[#6b7f5c]/35" style={{ height: 1, width: sw(48) }} />
        </div>

        <p
          className="text-center leading-relaxed"
          style={{ fontSize: s(25), color: '#5a5a52', marginBottom: s(40), maxWidth: sw(760) }}
        >
          {subtitle}
        </p>

        <QrBlock
          qrSrc={qrSrc}
          size={qrDisplaySize}
          frameClassName="rounded-sm border-2 border-[#6b7f5c]/30 shadow-[0_4px_24px_rgba(107,127,92,0.12)]"
        />

        <p
          className="text-center uppercase tracking-[0.26em]"
          style={{ fontSize: s(19), color: SAGE, marginTop: s(32), marginBottom: s(32) }}
        >
          Отсканируйте камерой телефона
        </p>

        {showPin ? (
          <PinBlock
            pin={pin!}
            format={format}
            frameClassName="rounded-sm border border-[#6b7f5c]/25 bg-white/70"
            labelClassName="text-[#6b7f5c]"
            codeClassName="text-ink"
            hintClassName="text-[#5a5a52]"
          />
        ) : (
          <p className="text-center" style={{ fontSize: s(23), color: '#5a5a52', marginBottom: s(24) }}>
            После сканирования загрузите фото с телефона
          </p>
        )}

        <QrCardFooter
          showPin={showPin}
          guestUrl={guestUrl}
          format={format}
          borderClassName="border-[#6b7f5c]/20"
          textClassName="text-[#5a5a52]"
          urlClassName="text-[#6b7f5c]/70"
        />
      </div>
    </PrintShell>
  );
});

export default QrPrintCardBotanical;
