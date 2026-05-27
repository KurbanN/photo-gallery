import { forwardRef } from 'react';
import { CardShell, PinBlock, QrBlock, QrCardFooter } from './QrCardShared';
import type { QrCardLayoutProps } from './types';

const GOLD = '#c4a962';
const INK = '#141414';
const CREAM = '#f5f0e8';

const QrPrintCardNoir = forwardRef<HTMLDivElement, QrCardLayoutProps>(function QrPrintCardNoir(
  { guestUrl, pin, brandName = 'Allmemories', qrSrc, headline, subtitle, showPin },
  ref,
) {
  return (
    <CardShell ref={ref} exportBg={INK} className="text-[#f5f0e8]" style={{ backgroundColor: INK }}>
      <div className="pointer-events-none absolute inset-[32px] border border-[#c4a962]/35" aria-hidden />
      <div className="pointer-events-none absolute inset-[40px] border border-[#c4a962]/12" aria-hidden />

      <div className="relative z-10 flex h-full flex-col items-center px-[72px] pt-[84px] pb-[64px]">
        <p
          className="mb-8 text-center uppercase tracking-[0.5em]"
          style={{ fontSize: 20, color: GOLD }}
        >
          {brandName}
        </p>

        <h1
          className="mb-4 max-w-full text-center leading-[1.12]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 66,
            fontWeight: 500,
            color: CREAM,
          }}
        >
          {headline}
        </h1>

        <p className="mb-10 max-w-[760px] text-center leading-relaxed text-[#a8a29a]" style={{ fontSize: 25 }}>
          {subtitle}
        </p>

        <QrBlock
          qrSrc={qrSrc}
          frameClassName="border border-[#c4a962]/40 shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
        />

        <p
          className="mb-8 mt-8 text-center uppercase tracking-[0.28em]"
          style={{ fontSize: 18, color: GOLD }}
        >
          Отсканируйте камерой телефона
        </p>

        {showPin ? (
          <PinBlock
            pin={pin!}
            frameClassName="border border-[#c4a962]/30 bg-[#1c1c1c]"
            labelClassName="text-[#c4a962]"
            codeClassName="text-[#f5f0e8]"
            hintClassName="text-[#a8a29a]"
          />
        ) : (
          <p className="mb-6 text-center text-[#a8a29a]" style={{ fontSize: 23 }}>
            После сканирования загрузите фото с телефона
          </p>
        )}

        <QrCardFooter
          showPin={showPin}
          guestUrl={guestUrl}
          borderClassName="border-[#c4a962]/20"
          textClassName="text-[#a8a29a]"
          urlClassName="text-[#c4a962]/60"
        />
      </div>
    </CardShell>
  );
});

export default QrPrintCardNoir;
