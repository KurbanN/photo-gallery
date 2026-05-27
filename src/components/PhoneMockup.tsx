import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  label?: string;
  className?: string;
};

/** Рамка смартфона для превью на лендинге. */
export default function PhoneMockup({ children, label, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label ? (
        <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-muted">{label}</p>
      ) : null}
      <div
        className="relative w-[148px] shrink-0 rounded-[1.75rem] border-[3px] border-ink bg-ink p-[5px] shadow-[0_18px_40px_-14px_rgba(26,26,26,0.35)] sm:w-[162px]"
        role="presentation"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-[9px] z-20 h-3 w-14 -translate-x-1/2 rounded-full bg-ink"
          aria-hidden
        />
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.35rem] bg-paper">
          {children}
        </div>
      </div>
    </div>
  );
}
