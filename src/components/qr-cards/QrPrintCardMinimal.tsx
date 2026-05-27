import { forwardRef } from 'react';
import { CardShell, PinBlock, QrBlock, QrCardFooter } from './QrCardShared';
import type { QrCardLayoutProps } from './types';

const QrPrintCardMinimal = forwardRef<HTMLDivElement, QrCardLayoutProps>(function QrPrintCardMinimal(
  { guestUrl, pin, brandName = 'Allmemories', qrSrc, headline, subtitle, showPin },
  ref,
) {
  return (
    <CardShell ref={ref} exportBg="#ffffff" className="bg-white text-ink">
      <div className="relative z-10 flex h-full flex-col items-center px-[88px] pt-[96px] pb-[72px]">
        <p
          className="mb-10 text-center uppercase tracking-[0.55em] text-ink/45"
          style={{ fontSize: 18, fontWeight: 500 }}
        >
          {brandName}
        </p>

        <div className="mb-10 h-px w-24 bg-ink/15" aria-hidden />

        <h1
          className="mb-5 max-w-full text-center leading-[1.1] text-ink"
          style={{ fontFamily: "'Montserrat', system-ui, sans-serif", fontSize: 52, fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          {headline}
        </h1>

        <p className="mb-14 max-w-[680px] text-center leading-relaxed text-muted" style={{ fontSize: 24 }}>
          {subtitle}
        </p>

        <QrBlock qrSrc={qrSrc} size={420} frameClassName="border border-ink/10 shadow-none p-6" />

        <p className="mb-10 mt-10 text-center uppercase tracking-[0.32em] text-ink/40" style={{ fontSize: 17 }}>
          Scan · Upload · Share
        </p>

        {showPin ? (
          <PinBlock
            pin={pin!}
            frameClassName="border border-ink/10 bg-ink/[0.02]"
            labelClassName="text-ink/45"
            codeClassName="text-ink"
            hintClassName="text-muted"
          />
        ) : (
          <p className="mb-6 text-center text-muted" style={{ fontSize: 22 }}>
            Отсканируйте и загрузите фото с телефона
          </p>
        )}

        <QrCardFooter
          showPin={showPin}
          guestUrl={guestUrl}
          borderClassName="border-ink/10"
          textClassName="text-ink/45"
          urlClassName="text-ink/30"
        />
      </div>
    </CardShell>
  );
});

export default QrPrintCardMinimal;
