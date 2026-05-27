import type { QrCardVariant } from '@/lib/qr-card-variants';
import type { QrPrintFormat } from '@/lib/qr-print-formats';

export type QrPrintCardProps = {
  guestUrl: string;
  eventTitle: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  pin?: string;
  pinEnabled?: boolean;
  brandName?: string;
  /** Фон как на экране входа — только для классического макета */
  bgUrl?: string | null;
  variant?: QrCardVariant;
  /** card = A6; banner-* = крупный формат для печати */
  format?: QrPrintFormat;
};

export type QrCardLayoutProps = QrPrintCardProps & {
  qrSrc: string | null;
  headline: string;
  subtitle: string;
  showPin: boolean;
  qrDisplaySize: number;
};
