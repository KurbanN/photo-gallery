import { forwardRef, type ReactNode } from 'react';

export const QR_CARD_WIDTH_PX = 1050;
export const QR_CARD_HEIGHT_PX = 1485;

type QrBlockProps = {
  qrSrc: string | null;
  size?: number;
  className?: string;
  frameClassName?: string;
};

export function QrBlock({ qrSrc, size = 400, className = '', frameClassName = '' }: QrBlockProps) {
  return (
    <div
      className={`flex items-center justify-center bg-white p-5 ${frameClassName}`}
      style={{ width: size + 40, height: size + 40 }}
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
  labelClassName?: string;
  codeClassName?: string;
  hintClassName?: string;
  frameClassName?: string;
};

export function PinBlock({
  pin,
  labelClassName = 'text-muted',
  codeClassName = 'text-ink',
  hintClassName = 'text-muted',
  frameClassName = 'border border-ink/15 bg-white/80',
}: PinBlockProps) {
  return (
    <div className={`w-full max-w-[720px] px-10 py-8 text-center ${frameClassName}`}>
      <p className={`mb-3 uppercase tracking-[0.35em] ${labelClassName}`} style={{ fontSize: 18 }}>
        Код мероприятия
      </p>
      <p
        className={`font-semibold tracking-[0.42em] ${codeClassName}`}
        style={{ fontSize: 56, letterSpacing: '0.42em' }}
      >
        {pin.trim()}
      </p>
      <p className={`mt-4 ${hintClassName}`} style={{ fontSize: 22 }}>
        Введите код после сканирования
      </p>
    </div>
  );
}

type FooterProps = {
  showPin: boolean;
  guestUrl: string;
  textClassName?: string;
  urlClassName?: string;
  borderClassName?: string;
};

export function QrCardFooter({ showPin, guestUrl, textClassName = 'text-muted', urlClassName = 'text-ink/50', borderClassName = 'border-line/80' }: FooterProps) {
  return (
    <div className={`mt-auto w-full border-t pt-8 text-center ${borderClassName}`}>
      <p className={textClassName} style={{ fontSize: 18 }}>
        {showPin ? '1. Сканируйте QR · 2. Введите код · 3. Загрузите фото' : 'Сканируйте QR и загрузите фото'}
      </p>
      <p className={`mt-3 break-all ${urlClassName}`} style={{ fontSize: 16, wordBreak: 'break-all' }}>
        {guestUrl.replace(/^https?:\/\//, '')}
      </p>
    </div>
  );
}

export function BotanicalWreath({ color = '#6b7f5c' }: { color?: string }) {
  return (
    <svg viewBox="0 0 320 48" fill="none" className="mx-auto mb-8 block" width={280} height={42} aria-hidden>
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

export const CardShell = forwardRef<
  HTMLDivElement,
  {
    exportBg: string;
    className?: string;
    style?: React.CSSProperties;
    children: ReactNode;
  }
>(function CardShell({ exportBg, className, style, children }, ref) {
  return (
    <div
      ref={ref}
      className={`qr-print-card relative overflow-hidden ${className ?? ''}`}
      data-export-bg={exportBg}
      style={{
        width: QR_CARD_WIDTH_PX,
        height: QR_CARD_HEIGHT_PX,
        fontFamily: "'Montserrat', system-ui, sans-serif",
        ...style,
      }}
    >
      {children}
    </div>
  );
});
