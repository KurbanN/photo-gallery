import type { EventSettings } from './organizer-api';
import { normalizeQrCardVariant, type QrCardVariant } from './qr-card-variants';

export const DEFAULT_GUEST_SUBTITLE =
  'Введите код с карточки на столе, чтобы просматривать и загружать фото с мероприятия';

export function buildGuestScreenSettings(
  eventTitle: string,
  welcomeTitle: string,
  welcomeSubtitle: string,
  extras?: Pick<EventSettings, 'loginBgUrl' | 'qrCardVariant'>,
): EventSettings {
  return {
    welcomeTitle: welcomeTitle.trim() || eventTitle.trim(),
    welcomeSubtitle: welcomeSubtitle.trim() || DEFAULT_GUEST_SUBTITLE,
    ...(extras?.loginBgUrl ? { loginBgUrl: extras.loginBgUrl } : {}),
    ...(extras?.qrCardVariant ? { qrCardVariant: extras.qrCardVariant } : {}),
  };
}

export function readQrCardVariant(settings: EventSettings | undefined): QrCardVariant {
  return normalizeQrCardVariant(settings?.qrCardVariant);
}
