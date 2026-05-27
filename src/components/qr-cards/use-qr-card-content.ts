import { useEffect, useState } from 'react';
import { qrDataUrl } from '@/lib/qr-data-url';
import { normalizeQrPrintFormat, QR_PRINT_FORMAT_SPECS } from '@/lib/qr-print-formats';
import type { QrPrintCardProps } from './types';

export function useQrCardContent({
  guestUrl,
  eventTitle,
  welcomeTitle,
  welcomeSubtitle,
  pin,
  pinEnabled = true,
  format: formatProp,
}: Pick<
  QrPrintCardProps,
  'guestUrl' | 'eventTitle' | 'welcomeTitle' | 'welcomeSubtitle' | 'pin' | 'pinEnabled' | 'format'
>) {
  const format = normalizeQrPrintFormat(formatProp);
  const spec = QR_PRINT_FORMAT_SPECS[format];
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const headline = (welcomeTitle || eventTitle).trim();
  const subtitle = welcomeSubtitle?.trim() || 'Сканируйте и делитесь фотографиями';
  const showPin = pinEnabled && Boolean(pin?.trim());

  useEffect(() => {
    let cancelled = false;
    void qrDataUrl(guestUrl, spec.qrGenerateSize).then((url) => {
      if (!cancelled) setQrSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [guestUrl, spec.qrGenerateSize]);

  return { qrSrc, headline, subtitle, showPin, format, qrDisplaySize: spec.qrDisplaySize };
}
