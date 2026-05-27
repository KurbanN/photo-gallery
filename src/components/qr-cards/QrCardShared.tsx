import { forwardRef, type ReactNode } from 'react';
import {
  QR_CARD_HEIGHT_PX,
  QR_CARD_WIDTH_PX,
  QR_PRINT_FORMAT_SPECS,
  scalePx,
  scaleWidthPx,
  type QrPrintFormat,
} from '@/lib/qr-print-formats';

export { QR_CARD_HEIGHT_PX, QR_CARD_WIDTH_PX };

type QrBlockProps = {
  qrSrc: string | null;
  size?: number;
  className?: string;
  frameClassName?: string;
};

export function QrBlock({ qrSrc, size = 400, className = '', frameClassName = '' }: QrBlockProps) {
  const pad = Math.round(size * 0.1);
  return (
    <div
      className={`flex items-center justify-center bg-white ${frameClassName}`}
      style={{ width: size + pad * 2, height: size + pad * 2, padding: pad }}
    >
      {qrSrc ? (
        <img src={qrSrc} alt="" width={size} height={size} className={`block ${className}`} />
      ) : (
        <div className="animate-pulse bg-line" style={{ width: size, height: size }} aria-hidden />
      )}
    </div>
  );
}

type PinBlockProps = {
  pin: string;
  format?: QrPrintFormat;
  labelClassName?: string;
  codeClassName?: string;
  hintClassName?: string;
  frameClassName?: string;
};

export function PinBlock({
  pin,
  format = 'card',
  labelClassName = 'text-muted',
  codeClassName = 'text-ink',
  hintClassName = 'text-muted',
  frameClassName = 'border border-ink/15 bg-white/80',
}: PinBlockProps) {
  const s = (px: number) => scalePx(px, format);
  return (
    <div
      className={`w-full text-center ${frameClassName}`}
      style={{
        maxWidth: scaleWidthPx(720, format),
        paddingLeft: scaleWidthPx(40, format),
        paddingRight: scaleWidthPx(40, format),
        paddingTop: s(32),
        paddingBottom: s(32),
      }}
    >
      <p className={`mb-3 uppercase tracking-[0.35em] ${labelClassName}`} style={{ fontSize: s(18) }}>
        Код мероприятия
      </p>
      <p
        className={`font-semibold tracking-[0.42em] ${codeClassName}`}
        style={{ fontSize: s(56), letterSpacing: '0.42em' }}
      >
        {pin.trim()}
      </p>
      <p className={`mt-4 ${hintClassName}`} style={{ fontSize: s(22) }}>
        Введите код после сканирования
      </p>
    </div>
  );
}

type FooterProps = {
  showPin: boolean;
  guestUrl: string;
  format?: QrPrintFormat;
  textClassName?: string;
  urlClassName?: string;
  borderClassName?: string;
};

export function QrCardFooter({
  showPin,
  guestUrl,
  format = 'card',
  textClassName = 'text-muted',
  urlClassName = 'text-ink/50',
  borderClassName = 'border-line/80',
}: FooterProps) {
  const s = (px: number) => scalePx(px, format);
  return (
    <div className={`mt-auto w-full border-t text-center ${borderClassName}`} style={{ paddingTop: s(32) }}>
      <p className={textClassName} style={{ fontSize: s(18) }}>
        {showPin ? '1. Сканируйте QR · 2. Введите код · 3. Загрузите фото' : 'Сканируйте QR и загрузите фото'}
      </p>
      <p className={`mt-3 break-all ${urlClassName}`} style={{ fontSize: s(16), wordBreak: 'break-all' }}>
        {guestUrl.replace(/^https?:\/\//, '')}
      </p>
    </div>
  );
}

export function BotanicalWreath({ color = '#6b7f5c', format = 'card' as QrPrintFormat }: { color?: string; format?: QrPrintFormat }) {
  const w = scaleWidthPx(280, format);
  const h = scalePx(42, format);
  return (
    <svg viewBox="0 0 320 48" fill="none" className="mx-auto block" style={{ width: w, height: h, marginBottom: scalePx(32, format) }} aria-hidden>
      <path
        d="M8 24c20-18 44-18 64 0s44 18 64 0 44-18 64 0 44 18 64 0"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.35"
      />
      <ellipse cx="48" cy="22" rx="14" ry="6" stroke={color} strokeWidth="1.2" transform="rotate(-25 48 22)" />
      <ellipse cx="272" cy="22" rx="14" ry="6" stroke={color} strokeWidth="1.2" transform="rotate(25 272 22)" />
      <circle cx="160" cy="24" r="3" fill={color} fillOpacity="0.5" />
      <path d="M152 24c4-8 8-12 8-12s4 4 8 12" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M168 24c-4-8-8-12-8-12s-4 4-8 12" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export const PrintShell = forwardRef<
  HTMLDivElement,
  {
    format?: QrPrintFormat;
    exportBg: string;
    className?: string;
    style?: React.CSSProperties;
    children: ReactNode;
  }
>(function PrintShell({ format = 'card', exportBg, className, style, children }, ref) {
  const spec = QR_PRINT_FORMAT_SPECS[format];
  return (
    <div
      ref={ref}
      className={`qr-print-card relative overflow-hidden ${className ?? ''}`}
      data-export-bg={exportBg}
      data-print-format={format}
      style={{
        width: spec.widthPx,
        height: spec.heightPx,
        fontFamily: "'Montserrat', system-ui, sans-serif",
        ...style,
      }}
    >
      {children}
    </div>
  );
});

/** @deprecated используйте PrintShell */
export const CardShell = PrintShell;
