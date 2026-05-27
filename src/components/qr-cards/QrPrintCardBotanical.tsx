import { forwardRef } from 'react';
import { BotanicalWreath, CardShell, PinBlock, QrBlock, QrCardFooter } from './QrCardShared';
import type { QrCardLayoutProps } from './types';

const SAGE = '#6b7f5c';
const CREAM = '#f4f1ea';

const QrPrintCardBotanical = forwardRef<HTMLDivElement, QrCardLayoutProps>(function QrPrintCardBotanical(
  { guestUrl, pin, brandName = 'Allmemories', qrSrc, headline, subtitle, showPin },
  ref,
) {
  return (
    <CardShell ref={ref} exportBg={CREAM} className="text-ink" style={{ backgroundColor: CREAM }}>
      <div
        className="pointer-events-none absolute inset-[24px] rounded-sm border border-[#6b7f5c]/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[24px] right-[24px] top-[24px] h-1 bg-[#6b7f5c]/20"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col items-center px-[76px] pt-[72px] pb-[60px]">
        <BotanicalWreath color={SAGE} />

        <p
          className="mb-5 text-center uppercase tracking-[0.42em]"
          style={{ fontSize: 20, color: SAGE }}
        >
          {brandName}
        </p>

        <h1
          className="mb-4 max-w-full text-center leading-[1.12] text-ink"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 68, fontWeight: 500 }}
        >
          {headline}
        </h1>

        <div className="mb-8 flex items-center gap-3" aria-hidden>
          <span className="h-px w-12 bg-[#6b7f5c]/35" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#6b7f5c]/50" />
          <span className="h-px w-12 bg-[#6b7f5c]/35" />
        </div>

        <p className="mb-10 max-w-[760px] text-center leading-relaxed" style={{ fontSize: 25, color: '#5a5a52' }}>
          {subtitle}
        </p>

        <QrBlock
          qrSrc={qrSrc}
          frameClassName="rounded-sm border-2 border-[#6b7f5c]/30 shadow-[0_4px_24px_rgba(107,127,92,0.12)]"
        />

        <p
          className="mb-8 mt-8 text-center uppercase tracking-[0.26em]"
          style={{ fontSize: 19, color: SAGE }}
        >
          Отсканируйте камерой телефона
        </p>

        {showPin ? (
          <PinBlock
            pin={pin!}
            frameClassName="rounded-sm border border-[#6b7f5c]/25 bg-white/70"
            labelClassName="text-[#6b7f5c]"
            codeClassName="text-ink"
            hintClassName="text-[#5a5a52]"
          />
        ) : (
          <p className="mb-6 text-center" style={{ fontSize: 23, color: '#5a5a52' }}>
            После сканирования загрузите фото с телефона
          </p>
        )}

        <QrCardFooter
          showPin={showPin}
          guestUrl={guestUrl}
          borderClassName="border-[#6b7f5c]/20"
          textClassName="text-[#5a5a52]"
          urlClassName="text-[#6b7f5c]/70"
        />
      </div>
    </CardShell>
  );
});

export default QrPrintCardBotanical;
