import { useEffect, useState } from 'react';
import { qrDataUrl } from '@/lib/qr-data-url';
import type { QrPrintCardProps } from './types';

export function useQrCardContent({
  guestUrl,
  eventTitle,
  welcomeTitle,
  welcomeSubtitle,
  pin,
  pinEnabled = true,
}: Pick<QrPrintCardProps, 'guestUrl' | 'eventTitle' | 'welcomeTitle' | 'welcomeSubtitle' | 'pin' | 'pinEnabled'>) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const headline = (welcomeTitle || eventTitle).trim();
  const subtitle = welcomeSubtitle?.trim() || 'Сканируйте и делитесь фотографиями';
  const showPin = pinEnabled && Boolean(pin?.trim());

  useEffect(() => {
    let cancelled = false;
    void qrDataUrl(guestUrl, 520).then((url) => {
      if (!cancelled) setQrSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [guestUrl]);

  return { qrSrc, headline, subtitle, showPin };
}
