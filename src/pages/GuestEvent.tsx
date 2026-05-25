import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import GuestBottomNav from '@/components/guest/GuestBottomNav';
import GuestEventHeader from '@/components/guest/GuestEventHeader';
import GuestGalleryPanel from '@/components/guest/GuestGalleryPanel';
import GuestMainTabs, { type GuestMainTab } from '@/components/guest/GuestMainTabs';
import GuestMediaLightbox from '@/components/guest/GuestMediaLightbox';
import GuestPinScreen from '@/components/guest/GuestPinScreen';
import GuestUploadPanel from '@/components/guest/GuestUploadPanel';
import { ApiRequestError } from '@/lib/api';
import {
  applyMaxVideoConstraints,
  captureStillFromVideo,
  tryEnableContinuousFocus,
  tryFocusAtNormalizedPoint,
} from '@/lib/camera';
import { usePageTitle } from '@/lib/brand';
import { buildDemoStaticPhotos, isDemoStaticPhotoId } from '@/lib/demo-static-photos';
import { formatEventDateLong, formatEventDateShort } from '@/lib/format-event-date';
import { getFavoriteIds, toggleFavorite } from '@/lib/guest-favorites';
import { filterFeedItems, type FeedFilter } from '@/lib/guest-media';
import {
  clearStoredPin,
  downloadPhotoFile,
  fetchEventPublic,
  fetchPhotos,
  getStoredPin,
  resolveBgUrl,
  setStoredPin,
  uploadPhoto,
  type EventPublic,
  type PhotoEntry,
} from '@/lib/guest-api';

export default function GuestEvent() {
  const navigate = useNavigate();
  const { slug = '' } = useParams<{ slug: string }>();

  const [eventPublic, setEventPublic] = useState<EventPublic | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [pin, setPin] = useState<string | null>(() => (slug ? getStoredPin(slug) : null));
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const [mainTab, setMainTab] = useState<GuestMainTab>('gallery');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('photo');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => getFavoriteIds(slug));
  const [feedError, setFeedError] = useState('');
  const [shootError, setShootError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [author, setAuthor] = useState('');
  const [lightbox, setLightbox] = useState<PhotoEntry | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const [uploadBanner, setUploadBanner] = useState<{
    kind: 'loading' | 'success' | 'error';
    text: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraGeneration = useRef(0);
  const cameraOpeningRef = useRef(false);
  const facingRef = useRef<'environment' | 'user'>('environment');
  const pendingBlobRef = useRef<Blob | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [cameraOpening, setCameraOpening] = useState(false);

  const bgUrl = resolveBgUrl(eventPublic?.settings.loginBgUrl);
  const welcomeTitle = eventPublic?.settings.welcomeTitle ?? 'Мероприятие';
  usePageTitle(eventPublic ? welcomeTitle : undefined);
  const dateLong = formatEventDateLong(eventPublic?.startsAt ?? eventPublic?.endsAt);
  const dateShort = formatEventDateShort(eventPublic?.startsAt ?? eventPublic?.endsAt);

  const filteredPhotos = useMemo(
    () => filterFeedItems(photos, feedFilter, favoriteIds),
    [photos, feedFilter, favoriteIds],
  );

  useEffect(() => {
    if (!slug) return;
    fetchEventPublic(slug)
      .then(setEventPublic)
      .catch((e) => setLoadErr(e instanceof Error ? e.message : 'Не найдено'));
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
        setMainTab('gallery');
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

  const discardPending = useCallback(() => {
    pendingBlobRef.current = null;
    setPendingPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const loadFeed = useCallback(async () => {
    if (pin === null || !slug) return;
    try {
      setFeedError('');
      const fromApi = await fetchPhotos(slug, pin);
      if (slug === 'demo' && fromApi.length === 0) {
        setPhotos(buildDemoStaticPhotos());
      } else {
        setPhotos(fromApi);
      }
    } catch (e) {
      if (slug === 'demo') {
        setFeedError('');
        setPhotos(buildDemoStaticPhotos());
      } else {
        setFeedError(e instanceof Error ? e.message : 'Ошибка ленты');
      }
    }
  }, [pin, slug]);

  useEffect(() => {
    if (pin === null) return;
    loadFeed();
    const t = window.setInterval(loadFeed, 4500);
    return () => window.clearInterval(t);
  }, [pin, loadFeed]);

  const stopCamera = useCallback(() => {
    cameraGeneration.current += 1;
    cameraOpeningRef.current = false;
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    const el = videoRef.current;
    if (el) el.srcObject = null;
    setCameraReady(false);
    setCameraBlocked(false);
    setCameraOpening(false);
    discardPending();
  }, [discardPending]);

  const openCamera = useCallback(async () => {
    if (pin === null || streamRef.current || cameraOpeningRef.current) return;
    const gen = cameraGeneration.current;
    cameraOpeningRef.current = true;
    setShootError('');
    setCameraBlocked(false);
    setCameraReady(false);
    setCameraOpening(true);
    try {
      const facing = facingRef.current;
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: facing }, width: { ideal: 3840 }, height: { ideal: 2160 } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: facing } },
        });
      }
      if (gen !== cameraGeneration.current) {
        stream.getTracks().forEach((tr) => tr.stop());
        return;
      }
      const vtrack = stream.getVideoTracks()[0];
      if (vtrack) await applyMaxVideoConstraints(vtrack);
      if (vtrack) tryEnableContinuousFocus(vtrack);
      streamRef.current = stream;
      const el = videoRef.current;
      if (el) {
        el.srcObject = stream;
        await el.play().catch(() => {});
        setCameraReady(true);
      }
    } catch {
      setCameraBlocked(true);
    } finally {
      cameraOpeningRef.current = false;
      if (gen === cameraGeneration.current) setCameraOpening(false);
    }
  }, [pin]);

  const flipCamera = useCallback(() => {
    if (pendingPreviewUrl) return;
    const next = facingRef.current === 'environment' ? 'user' : 'environment';
    facingRef.current = next;
    setCameraFacing(next);
    if (!streamRef.current && !cameraOpeningRef.current) return;
    stopCamera();
    queueMicrotask(() => void openCamera());
  }, [pendingPreviewUrl, stopCamera, openCamera]);

  const handleVideoTapFocus = useCallback(
    (e: React.PointerEvent<HTMLVideoElement>) => {
      if (pendingPreviewUrl || !streamRef.current) return;
      const track = streamRef.current.getVideoTracks()[0];
      if (!track?.readyState || track.readyState !== 'live') return;
      const el = videoRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      if (cameraFacing === 'user') nx = 1 - nx;
      void tryFocusAtNormalizedPoint(track, nx, ny);
    },
    [pendingPreviewUrl, cameraFacing],
  );

  useEffect(() => {
    if (mainTab !== 'upload' || pin === null) stopCamera();
  }, [mainTab, pin, stopCamera]);

  const enterWithPin = async (code: string) => {
    if (!eventPublic) return;
    setPinError('');
    setPinLoading(true);
    try {
      await fetchPhotos(slug, code);
      setStoredPin(slug, code);
      setPin(code);
      setPinInput('');
      setMainTab('gallery');
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

  const goHome = () => {
    stopCamera();
    clearStoredPin(slug);
    setPhotos([]);
    setLightbox(null);
    navigate('/');
  };

  const submitMediaBlob = async (
    blob: Blob,
    opts?: { afterCamera?: boolean; batch?: { index: number; total: number }; goToGallery?: boolean },
  ) => {
    if (pin === null) return;
    if (!eventPublic?.uploadsOpen) {
      setShootError(eventPublic?.uploadsClosedReason || 'Загрузка закрыта');
      return;
    }
    setUploading(true);
    setShootError('');
    const isVideo = blob.type.startsWith('video/');
    const batchLabel =
      opts?.batch && opts.batch.total > 1
        ? `Загрузка ${opts.batch.index} из ${opts.batch.total}…`
        : isVideo
          ? 'Загрузка видео…'
          : 'Загрузка фото…';
    setUploadBanner({ kind: 'loading', text: batchLabel });
    try {
      await uploadPhoto(slug, pin, blob, author.trim() || undefined);
      if (opts?.afterCamera) discardPending();
      const text =
        opts?.batch && opts.batch.total > 1
          ? `Загружено ${opts.batch.index} из ${opts.batch.total}.`
          : isVideo
            ? 'Видео загружено и уже в ленте.'
            : 'Фото загружено и уже в ленте.';
      setUploadNotice(text);
      setUploadBanner({ kind: 'success', text });
      await loadFeed();
      if (opts?.goToGallery !== false && (!opts?.batch || opts.batch.index === opts.batch.total)) {
        setAuthor('');
        window.setTimeout(() => {
          setMainTab('gallery');
          setFeedFilter(isVideo ? 'video' : 'photo');
          setUploadBanner(null);
        }, 1400);
      } else if (opts?.batch && opts.batch.index < opts.batch.total) {
        window.setTimeout(() => setUploadBanner(null), 400);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не удалось загрузить';
      setShootError(msg);
      setUploadBanner({ kind: 'error', text: msg });
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current || pendingPreviewUrl) return;
    setShootError('');
    setUploadBanner(null);
    try {
      const blob = await captureStillFromVideo(videoRef.current, cameraFacing === 'user');
      pendingBlobRef.current = blob;
      setPendingPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      streamRef.current?.getVideoTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
      const el = videoRef.current;
      if (el) el.srcObject = null;
      setCameraReady(false);
      setCameraOpening(false);
      cameraOpeningRef.current = false;
    } catch (e) {
      setShootError(e instanceof Error ? e.message : 'Не удалось снять');
    }
  };

  const handlePickFiles = async (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
      await submitMediaBlob(files[i], {
        batch: { index: i + 1, total: files.length },
        goToGallery: i === files.length - 1,
      });
    }
  };

  const handleDownload = async (p: PhotoEntry) => {
    if (pin === null) return;
    if (isDemoStaticPhotoId(p.id)) {
      const a = document.createElement('a');
      a.href = p.url;
      a.download = `demo-${p.id.slice(12)}`;
      a.rel = 'noopener';
      a.click();
      return;
    }
    setDownloadBusy(true);
    try {
      const blob = await downloadPhotoFile(slug, pin, p.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-${p.id.slice(0, 8)}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setDownloadBusy(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(slug, id);
    setFavoriteIds(getFavoriteIds(slug));
  };

  if (loadErr) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center text-muted">
        {loadErr}
      </div>
    );
  }

  if (!eventPublic) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (pin === null) {
    if (!eventPublic.pinRequired) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper px-6">
          {pinLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          ) : (
            <>
              <p className="text-center text-sm text-red-700">{pinError || 'Не удалось открыть ленту'}</p>
              <button
                type="button"
                onClick={() => void enterWithPin('')}
                className="rounded-full bg-ink px-8 py-3 text-xs uppercase text-paper"
              >
                Повторить
              </button>
            </>
          )}
        </div>
      );
    }
    return (
      <GuestPinScreen
        welcomeTitle={welcomeTitle}
        eventDateShort={dateShort}
        bgUrl={bgUrl}
        pin={pinInput}
        onPinChange={setPinInput}
        error={pinError}
        loading={pinLoading}
        onSubmit={() => void enterWithPin(pinInput.trim())}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <GuestEventHeader title={welcomeTitle} dateLabel={dateLong} onHomeClick={goHome} />

      {uploadNotice && (
        <p className="border-b border-line bg-ink/5 px-4 py-2 text-center text-xs text-muted">
          {uploadNotice}
        </p>
      )}

      <GuestMainTabs active={mainTab} onChange={setMainTab} />

      <main className="flex-1">
        {mainTab === 'gallery' ? (
          <GuestGalleryPanel
            items={filteredPhotos}
            filter={feedFilter}
            favoriteIds={favoriteIds}
            feedError={feedError}
            onRefresh={() => void loadFeed()}
            onOpen={setLightbox}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <GuestUploadPanel
            uploadsOpen={eventPublic.uploadsOpen}
            uploadsClosedReason={eventPublic.uploadsClosedReason}
            uploading={uploading}
            uploadBanner={uploadBanner}
            shootError={shootError}
            author={author}
            onAuthorChange={setAuthor}
            onPickFiles={(files) => void handlePickFiles(files)}
            camera={{
              videoRef,
              bgUrl,
              cameraReady,
              cameraBlocked,
              cameraOpening,
              pendingPreviewUrl,
              cameraFacing,
              uploading,
              uploadsOpen: eventPublic.uploadsOpen,
              uploadBanner,
              shootError,
              author,
              onAuthorChange: setAuthor,
              onOpenCamera: () => void openCamera(),
              onFlipCamera: flipCamera,
              onTakePhoto: () => void takePhoto(),
              onDiscardPending: () => {
                discardPending();
                void openCamera();
              },
              onConfirmUpload: () => {
                const blob = pendingBlobRef.current;
                if (blob) void submitMediaBlob(blob, { afterCamera: true });
              },
              onVideoTapFocus: handleVideoTapFocus,
            }}
          />
        )}
      </main>

      {mainTab === 'gallery' && <GuestBottomNav active={feedFilter} onChange={setFeedFilter} />}

      {lightbox && (
        <GuestMediaLightbox
          item={lightbox}
          downloadBusy={downloadBusy}
          onClose={() => setLightbox(null)}
          onDownload={() => void handleDownload(lightbox)}
        />
      )}
    </div>
  );
}
