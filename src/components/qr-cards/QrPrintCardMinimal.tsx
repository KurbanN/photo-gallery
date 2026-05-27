import { forwardRef } from 'react';
import { normalizeQrPrintFormat, scalePx, scaleWidthPx } from '@/lib/qr-print-formats';
import { PinBlock, PrintShell, QrBlock, QrCardFooter } from './QrCardShared';
import type { QrCardLayoutProps } from './types';

const QrPrintCardMinimal = forwardRef<HTMLDivElement, QrCardLayoutProps>(function QrPrintCardMinimal(
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

  return (
    <PrintShell ref={ref} format={format} exportBg="#ffffff" className="bg-white text-ink">
      <div
        className="relative z-10 flex h-full flex-col items-center"
        style={{
          paddingLeft: sw(88),
          paddingRight: sw(88),
          paddingTop: s(96),
          paddingBottom: s(72),
        }}
      >
        <p
          className="text-center uppercase tracking-[0.55em] text-ink/45"
          style={{ fontSize: s(18), fontWeight: 500, marginBottom: s(40) }}
        >
          {brandName}
        </p>

        <div className="bg-ink/15" style={{ marginBottom: s(40), height: 1, width: sw(96) }} aria-hidden />

        <h1
          className="max-w-full text-center leading-[1.1] text-ink"
          style={{
            fontFamily: "'Montserrat', system-ui, sans-serif",
            fontSize: s(52),
            fontWeight: 600,
            letterSpacing: '-0.02em',
            marginBottom: s(20),
          }}
        >
          {headline}
        </h1>

        <p
          className="text-center leading-relaxed text-muted"
          style={{ fontSize: s(24), marginBottom: s(56), maxWidth: sw(680) }}
        >
          {subtitle}
        </p>

        <QrBlock qrSrc={qrSrc} size={qrDisplaySize} frameClassName="border border-ink/10 shadow-none" />

        <p
          className="text-center uppercase tracking-[0.32em] text-ink/40"
          style={{ fontSize: s(17), marginTop: s(40), marginBottom: s(40) }}
        >
          Scan · Upload · Share
        </p>

        {showPin ? (
          <PinBlock
            pin={pin!}
            format={format}
            frameClassName="border border-ink/10 bg-ink/[0.02]"
            labelClassName="text-ink/45"
            codeClassName="text-ink"
            hintClassName="text-muted"
          />
        ) : (
          <p className="text-center text-muted" style={{ fontSize: s(22), marginBottom: s(24) }}>
            Отсканируйте и загрузите фото с телефона
          </p>
        )}

        <QrCardFooter
          showPin={showPin}
          guestUrl={guestUrl}
          format={format}
          borderClassName="border-ink/10"
          textClassName="text-ink/45"
          urlClassName="text-ink/30"
        />
      </div>
    </PrintShell>
  );
});

export default QrPrintCardMinimal;
