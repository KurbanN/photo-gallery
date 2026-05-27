import { forwardRef } from 'react';
import KazakhOrnamentFrame, { KAZAKH_THEME } from './KazakhOrnamentFrame';
import { CardShell, PinBlock, QrBlock, QrCardFooter } from './QrCardShared';
import type { QrCardLayoutProps } from './types';

const QrPrintCardKazakh = forwardRef<HTMLDivElement, QrCardLayoutProps>(function QrPrintCardKazakh(
  { guestUrl, pin, brandName = 'Allmemories', qrSrc, headline, subtitle, showPin },
  ref,
) {
  return (
    <CardShell
      ref={ref}
      exportBg={KAZAKH_THEME.bg}
      className="text-ink"
      style={{ backgroundColor: KAZAKH_THEME.bg }}
    >
      <KazakhOrnamentFrame color={KAZAKH_THEME.blue} accent={KAZAKH_THEME.gold} />

      <div className="relative z-10 flex h-full flex-col items-center px-[88px] pt-[108px] pb-[72px]">
        <p
          className="mb-4 text-center uppercase tracking-[0.48em]"
          style={{ fontSize: 20, color: KAZAKH_THEME.terracotta, fontWeight: 600 }}
        >
          {brandName}
        </p>

        <div className="mb-6 flex items-center gap-4" aria-hidden>
          <span className="h-px w-16" style={{ backgroundColor: `${KAZAKH_THEME.gold}66` }} />
          <span
            className="inline-block h-2.5 w-2.5 rotate-45 border"
            style={{ borderColor: KAZAKH_THEME.gold, backgroundColor: `${KAZAKH_THEME.gold}22` }}
          />
          <span className="h-px w-16" style={{ backgroundColor: `${KAZAKH_THEME.gold}66` }} />
        </div>

        <h1
          className="mb-3 max-w-full text-center leading-[1.1] text-ink"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 62,
            fontWeight: 500,
            color: KAZAKH_THEME.ink,
          }}
        >
          {headline}
        </h1>

        <p
          className="mb-8 max-w-[720px] text-center leading-relaxed"
          style={{ fontSize: 24, color: KAZAKH_THEME.muted }}
        >
          {subtitle}
        </p>

        <QrBlock
          qrSrc={qrSrc}
          frameClassName="rounded-sm border-2 border-[#1e4d6b]/40 shadow-[0_6px_28px_rgba(30,77,107,0.12)]"
        />

        <p
          className="mb-6 mt-8 text-center uppercase tracking-[0.26em]"
          style={{ fontSize: 18, color: KAZAKH_THEME.blue }}
        >
          Отсканируйте камерой телефона
        </p>

        {showPin ? (
          <PinBlock
            pin={pin!}
            frameClassName="rounded-sm border-2 border-[#1e4d6b]/25 bg-white/85"
            labelClassName="text-[#1e4d6b]"
            codeClassName="text-ink"
            hintClassName="text-[#5c5348]"
          />
        ) : (
          <p className="mb-4 text-center" style={{ fontSize: 22, color: KAZAKH_THEME.muted }}>
            После сканирования загрузите фото с телефона
          </p>
        )}

        <QrCardFooter
          showPin={showPin}
          guestUrl={guestUrl}
          borderClassName="border-[#1e4d6b]/20"
          textClassName="text-[#5c5348]"
          urlClassName="text-[#1e4d6b]/65"
        />
      </div>
    </CardShell>
  );
});

export default QrPrintCardKazakh;
