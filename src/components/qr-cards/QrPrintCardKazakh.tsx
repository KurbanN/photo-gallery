import { forwardRef } from 'react';
import KazakhOrnamentFrame, { ORNAMENT_FRAME_THEME } from './KazakhOrnamentFrame';
import { CardShell, PinBlock, QrBlock, QrCardFooter } from './QrCardShared';
import type { QrCardLayoutProps } from './types';

const T = ORNAMENT_FRAME_THEME;

const QrPrintCardKazakh = forwardRef<HTMLDivElement, QrCardLayoutProps>(function QrPrintCardKazakh(
  { guestUrl, pin, brandName = 'Allmemories', qrSrc, headline, subtitle, showPin },
  ref,
) {
  return (
    <CardShell
      ref={ref}
      exportBg={T.bg}
      className="text-ink"
      style={{ backgroundColor: T.bg }}
    >
      <KazakhOrnamentFrame />

      <div className="relative z-10 flex h-full flex-col items-center px-[96px] pt-[112px] pb-[88px]">
        <p
          className="mb-5 text-center uppercase tracking-[0.42em]"
          style={{ fontSize: 20, color: T.burgundy, fontWeight: 600 }}
        >
          {brandName}
        </p>

        <h1
          className="mb-4 max-w-full text-center leading-[1.1] text-ink"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 60,
            fontWeight: 500,
          }}
        >
          {headline}
        </h1>

        <p className="mb-9 max-w-[700px] text-center leading-relaxed text-muted" style={{ fontSize: 24 }}>
          {subtitle}
        </p>

        <QrBlock
          qrSrc={qrSrc}
          frameClassName="border border-[#9a7348]/45 shadow-[0_6px_24px_rgba(10,10,10,0.08)]"
        />

        <p
          className="mb-6 mt-8 text-center uppercase tracking-[0.24em]"
          style={{ fontSize: 17, color: T.gold }}
        >
          Отсканируйте камерой телефона
        </p>

        {showPin ? (
          <PinBlock
            pin={pin!}
            frameClassName="border border-[#8b2e3c]/25 bg-white/90"
            labelClassName="text-[#8b2e3c]"
            codeClassName="text-ink"
            hintClassName="text-muted"
          />
        ) : (
          <p className="mb-4 text-center text-muted" style={{ fontSize: 22 }}>
            После сканирования загрузите фото с телефона
          </p>
        )}

        <QrCardFooter
          showPin={showPin}
          guestUrl={guestUrl}
          borderClassName="border-[#9a7348]/25"
          textClassName="text-muted"
          urlClassName="text-[#9a7348]/80"
        />
      </div>
    </CardShell>
  );
});

export default QrPrintCardKazakh;
