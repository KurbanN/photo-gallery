import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GuestPinScreen from '@/components/guest/GuestPinScreen';
import LiveSlideshow from '@/components/live/LiveSlideshow';
import { ApiRequestError } from '@/lib/api';
import { usePageTitle } from '@/lib/brand';
import { buildDemoStaticPhotos } from '@/lib/demo-static-photos';
import { formatEventDateShort } from '@/lib/format-event-date';
import { guestEventUrl } from '@/lib/app-url';
import {
  fetchEventPublic,
  fetchPhotos,
  getStoredPin,
  resolveBgUrl,
  setStoredPin,
  type EventPublic,
  type PhotoEntry,
} from '@/lib/guest-api';
import { qrDataUrl } from '@/lib/qr-data-url';

const POLL_MS = 4500;

export default function EventLiveDisplay() {
  const { slug = '' } = useParams<{ slug: string }>();

  const [eventPublic, setEventPublic] = useState<EventPublic | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [pin, setPin] = useState<string | null>(() => (slug ? getStoredPin(slug) : null));
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const welcomeTitle = eventPublic?.settings.welcomeTitle ?? 'Мероприятие';
  usePageTitle(eventPublic ? `${welcomeTitle} · экран` : 'Экран');
  const dateShort = formatEventDateShort(eventPublic?.startsAt ?? eventPublic?.endsAt);
  const bgUrl = resolveBgUrl(eventPublic?.settings.loginBgUrl);

  useEffect(() => {
    if (!slug) return;
    fetchEventPublic(slug)
      .then(setEventPublic)
      .catch((e) => setLoadErr(e instanceof Error ? e.message : 'Не найдено'));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    void qrDataUrl(guestEventUrl(slug), 280).then(setQrSrc).catch(() => setQrSrc(null));
  }, [slug]);

  useEffect(() => {
    if (!slug || !eventPublic || eventPublic.pinRequired || pin !== null) return;
    let cancelled = false;
    const enter = async () => {
      setPinLoading(true);
      setPinError('');
      try {
        await fetchPhotos(slug, '');
        if (cancelled) return;
        setStoredPin(slug, '');
        setPin('');
      } catch (err) {
        if (cancelled) return;
        setPinError(err instanceof Error ? err.message : 'Не удалось открыть');
      } finally {
        if (!cancelled) setPinLoading(false);
      }
    };
    void enter();
    return () => {
      cancelled = true;
    };
  }, [slug, eventPublic, pin]);

  const loadFeed = useCallback(async () => {
    if (pin === null || !slug) return;
    try {
      const fromApi = await fetchPhotos(slug, pin);
      if (slug === 'demo' && fromApi.length === 0) {
        setPhotos(buildDemoStaticPhotos());
      } else {
        setPhotos(fromApi);
      }
    } catch {
      if (slug === 'demo') {
        setPhotos(buildDemoStaticPhotos());
      }
    }
  }, [pin, slug]);

  useEffect(() => {
    if (pin === null) return;
    void loadFeed();
    const t = window.setInterval(loadFeed, POLL_MS);
    return () => window.clearInterval(t);
  }, [pin, loadFeed]);

  const enterWithPin = async (code: string) => {
    if (!eventPublic) return;
    setPinError('');
    setPinLoading(true);
    try {
      await fetchPhotos(slug, code);
      setStoredPin(slug, code);
      setPin(code);
      setPinInput('');
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        setPinError('Код не подходит.');
      } else {
        setPinError(err instanceof Error ? err.message : 'Ошибка входа');
      }
    } finally {
      setPinLoading(false);
    }
  };

  if (loadErr) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black px-6 text-center text-white">
        <p>{loadErr}</p>
      </div>
    );
  }

  if (!eventPublic) {
    return <div className="min-h-dvh bg-black" />;
  }

  if (eventPublic.pinRequired && pin === null) {
    return (
      <GuestPinScreen
        welcomeTitle={welcomeTitle}
        eventDateShort={dateShort}
        bgUrl={bgUrl}
        pin={pinInput}
        onPinChange={setPinInput}
        error={pinError}
        loading={pinLoading}
        onSubmit={() => void enterWithPin(pinInput)}
        description="Введите PIN с карточки на столе — экран покажет общую ленту фото"
        submitLabel="На экран"
      />
    );
  }

  if (!eventPublic.pinRequired && pin === null) {
    return <div className="min-h-dvh bg-black" />;
  }

  return (
    <LiveSlideshow items={photos} eventTitle={welcomeTitle} qrDataUrl={qrSrc} />
  );
}
