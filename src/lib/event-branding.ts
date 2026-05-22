import type { EventSettings } from './organizer-api';

export const DEFAULT_GUEST_SUBTITLE =
  'Введите код с карточки на столе, затем снимайте и смотрите фото гостей.';

export function buildGuestScreenSettings(
  eventTitle: string,
  welcomeTitle: string,
  welcomeSubtitle: string,
  loginBgUrl?: string,
): EventSettings {
  return {
    welcomeTitle: welcomeTitle.trim() || eventTitle.trim(),
    welcomeSubtitle: welcomeSubtitle.trim() || DEFAULT_GUEST_SUBTITLE,
    ...(loginBgUrl ? { loginBgUrl } : {}),
  };
}
