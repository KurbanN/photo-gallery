import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Camera,
  Check,
  FileImage,
  Grid3x3,
  Download,
  Loader2,
  LogOut,
  RefreshCw,
  Send,
  SwitchCamera,
  X,
} from 'lucide-react';
import { ApiRequestError } from '@/lib/api';
import {
  applyMaxVideoConstraints,
  captureStillFromVideo,
  isProbablyImageFile,
  tryEnableContinuousFocus,
  tryFocusAtNormalizedPoint,
} from '@/lib/camera';
import { usePageTitle } from '@/lib/brand';
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

type Tab = 'shoot' | 'feed';

export default function GuestEvent() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [eventPublic, setEventPublic] = useState<EventPublic | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [pin, setPin] = useState<string | null>(() => (slug ? getStoredPin(slug) : null));
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const [tab, setTab] = useState<Tab>('shoot');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
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
  const welcomeSubtitle =
    eventPublic?.settings.welcomeSubtitle ??
    'Введите код с карточки на столе, затем снимайте и смотрите фото гостей.';
  const headerSub = eventPublic?.settings.headerSubtitle ?? eventPublic?.title;

  useEffect(() => {
    if (!slug) return;
    fetchEventPublic(slug)
      .then(setEventPublic)
      .catch((e) => setLoadErr(e instanceof Error ? e.message : 'Не найдено'));
  }, [slug]);

  /** Демо и мероприятия без PIN — сразу в ленту */
  useEffect(() => {
    if (!slug || !eventPublic || eventPublic.pinRequired || pin) return;
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
        setPinError(err instanceof Error ? err.message : 'Не удалось открыть демо');
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
    if (!pin || !slug) return;
    try {
      setFeedError('');
      setPhotos(await fetchPhotos(slug, pin));
    } catch (e) {
      setFeedError(e instanceof Error ? e.message : 'Ошибка ленты');
    }
  }, [pin, slug]);

  useEffect(() => {
    if (!pin) return;
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
    if (!pin || streamRef.current || cameraOpeningRef.current) return;
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
    if (tab !== 'shoot' || !pin) stopCamera();
  }, [tab, pin, stopCamera]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventPublic) return;
    setPinError('');
    const p = eventPublic.pinRequired ? pinInput.trim() : '';
    if (eventPublic.pinRequired && !p) {
      setPinError('Введите код');
      return;
    }
    setPinLoading(true);
    try {
      await fetchPhotos(slug, p);
      setStoredPin(slug, p);
      setPin(p);
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

  const logout = () => {
    discardPending();
    clearStoredPin(slug);
    setPin(null);
    setPhotos([]);
    setLightbox(null);
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

  const submitPhotoBlob = async (
    blob: Blob,
    opts?: { afterCamera?: boolean; batch?: { index: number; total: number }; goToFeed?: boolean },
  ) => {
    if (!pin) return;
    if (!eventPublic?.uploadsOpen) {
      setShootError(eventPublic?.uploadsClosedReason || 'Загрузка закрыта');
      return;
    }
    setUploading(true);
    setShootError('');
    const batchLabel =
      opts?.batch && opts.batch.total > 1
        ? `Загрузка ${opts.batch.index} из ${opts.batch.total}…`
        : 'Загрузка фото…';
    setUploadBanner({ kind: 'loading', text: batchLabel });
    try {
      await uploadPhoto(slug, pin, blob, author.trim() || undefined);
      if (opts?.afterCamera) discardPending();
      const text =
        opts?.batch && opts.batch.total > 1
          ? `Загружено ${opts.batch.index} из ${opts.batch.total}.`
          : 'Фото загружено и уже в общей ленте.';
      setUploadNotice(text);
      setUploadBanner({ kind: 'success', text });
      await loadFeed();
      if (opts?.goToFeed !== false && (!opts?.batch || opts.batch.index === opts.batch.total)) {
        setAuthor('');
        window.setTimeout(() => {
          setTab('feed');
          setUploadBanner(null);
        }, 1600);
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

  const confirmPendingUpload = async () => {
    const blob = pendingBlobRef.current;
    if (!blob) return;
    await submitPhotoBlob(blob, { afterCamera: true });
  };

  const triggerImageUpload = () => {
    if (!pin || !eventPublic?.uploadsOpen) {
      setShootError(eventPublic?.uploadsClosedReason || 'Загрузка закрыта');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
      const list = input.files ? Array.from(input.files).filter(isProbablyImageFile) : [];
      if (list.length === 0) {
        setShootError('Выберите одно или несколько фото');
        setUploadBanner({ kind: 'error', text: 'Нужен файл изображения' });
        return;
      }
      setShootError('');
      for (let i = 0; i < list.length; i++) {
        await submitPhotoBlob(list[i], {
          batch: { index: i + 1, total: list.length },
          goToFeed: i === list.length - 1,
        });
      }
    };
    input.click();
  };

  const handleDownload = async (p: PhotoEntry) => {
    if (!pin) return;
    setDownloadBusy(true);
    try {
      const blob = await downloadPhotoFile(slug, pin, p.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-${p.id.slice(0, 8)}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setDownloadBusy(false);
    }
  };

  if (loadErr) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center text-muted">
        {loadErr}
      </div>
    );
  }

  if (!eventPublic) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!pin) {
    if (!eventPublic.pinRequired && pinLoading) {
      return (
        <div className="min-h-dvh flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      );
    }
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 bg-paper">
        {bgUrl ? (
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgUrl})` }}
            aria-hidden
          />
        ) : null}
        <div
          className={`pointer-events-none absolute inset-0 ${
            bgUrl
              ? 'bg-gradient-to-b from-paper/88 via-paper/78 to-paper/90 backdrop-blur-[2px]'
              : 'bg-gradient-to-b from-paper via-line/20 to-paper'
          }`}
        />
        <div className="relative z-10 flex w-full max-w-xs flex-col items-center">
          <p className="mb-2 text-center font-serif text-3xl text-ink md:text-4xl">{welcomeTitle}</p>
          <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-muted">{welcomeSubtitle}</p>
          <form onSubmit={handlePinSubmit} className="w-full space-y-4">
            {eventPublic.pinRequired && (
              <>
                <label className="block text-[11px] uppercase tracking-[0.2em] text-muted">Код мероприятия</label>
                <input
                  type="password"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full border border-line/90 bg-white/95 px-4 py-3 text-center text-lg tracking-[0.3em] shadow-sm outline-none focus:border-ink"
                />
              </>
            )}
            {pinError && <p className="text-center text-sm text-red-700">{pinError}</p>}
            <button
              type="submit"
              disabled={pinLoading}
              className="flex w-full items-center justify-center gap-2 bg-ink py-3 text-xs font-semibold uppercase tracking-[0.25em] text-paper disabled:opacity-60"
            >
              {pinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-paper pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-serif text-lg text-ink">{welcomeTitle}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{headerSub}</p>
        </div>
        <button type="button" onClick={logout} className="p-2 text-muted" aria-label="Выйти">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {uploadNotice && (
        <p className="bg-ink/5 text-center text-xs text-muted px-4 py-2 border-b border-line">{uploadNotice}</p>
      )}

      <nav className="flex border-b border-line">
        <button
          type="button"
          onClick={() => setTab('shoot')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] ${
            tab === 'shoot' ? 'bg-ink text-paper' : 'text-muted'
          }`}
        >
          <Camera className="w-4 h-4" /> Снять
        </button>
        <button
          type="button"
          onClick={() => setTab('feed')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] ${
            tab === 'feed' ? 'bg-ink text-paper' : 'text-muted'
          }`}
        >
          <Grid3x3 className="w-4 h-4" /> Лента
        </button>
      </nav>

      <main className="flex-1">
        {tab === 'shoot' && (
          <div className="p-4 max-w-lg mx-auto space-y-4">
            {!eventPublic.uploadsOpen && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2">
                {eventPublic.uploadsClosedReason || 'Приём фото закрыт. Ленту можно смотреть.'}
              </p>
            )}
            <div className="relative aspect-[3/4] bg-black overflow-hidden border border-line">
              <video
                ref={videoRef}
                className={`absolute inset-0 z-[1] h-full w-full object-cover ${
                  cameraReady && !pendingPreviewUrl ? 'opacity-100' : 'opacity-0'
                } ${cameraFacing === 'user' ? '[transform:scaleX(-1)]' : ''}`}
                playsInline
                muted
                onPointerDown={cameraReady && !pendingPreviewUrl ? handleVideoTapFocus : undefined}
              />
              {!cameraReady && !pendingPreviewUrl && (
                <div className="absolute inset-0 flex flex-col">
                  {bgUrl ? (
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }} />
                  ) : (
                    <div className="absolute inset-0 bg-ink/80" />
                  )}
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 p-6">
                    {cameraOpening ? (
                      <Loader2 className="h-10 w-10 animate-spin text-paper" />
                    ) : cameraBlocked ? (
                      <button type="button" onClick={openCamera} className="bg-ink px-6 py-3 text-xs text-paper uppercase">
                        Попробовать снова
                      </button>
                    ) : (
                      <button type="button" onClick={openCamera} className="bg-ink px-8 py-4 text-xs text-paper uppercase">
                        Открыть камеру
                      </button>
                    )}
                  </div>
                </div>
              )}
              {pendingPreviewUrl && (
                <div className="absolute inset-0 z-40 grid grid-rows-[1fr_auto] bg-black">
                  <img src={pendingPreviewUrl} alt="" className="min-h-0 w-full h-full object-contain" />
                  <div className="flex gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/20 bg-black shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        discardPending();
                        void openCamera();
                      }}
                      disabled={uploading}
                      className="flex-1 min-h-[3rem] border border-paper/50 py-3 text-xs text-paper uppercase disabled:opacity-50"
                    >
                      Переснять
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmPendingUpload()}
                      disabled={uploading}
                      className="flex-1 min-h-[3rem] flex items-center justify-center gap-2 bg-paper py-3 text-xs font-semibold text-ink uppercase disabled:opacity-60"
                    >
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      Отправить
                    </button>
                  </div>
                </div>
              )}
              {cameraReady && !pendingPreviewUrl && (
                <>
                  <button type="button" onClick={flipCamera} className="absolute bottom-5 left-4 z-20 p-3 rounded-full bg-black/45 text-paper">
                    <SwitchCamera className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void takePhoto()}
                    className="absolute bottom-5 left-1/2 z-20 h-[4.5rem] w-[4.5rem] -translate-x-1/2 rounded-full border-4 border-paper"
                    aria-label="Сфотографировать"
                  />
                  <button type="button" onClick={stopCamera} className="absolute bottom-5 right-4 z-20 text-[10px] text-paper uppercase">
                    Выключить
                  </button>
                </>
              )}
            </div>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Подпись (необязательно)"
              className="w-full border border-line px-3 py-2"
              maxLength={80}
            />
            {uploadBanner && (
              <p
                className={`text-sm px-3 py-3 text-center border flex items-center justify-center gap-2 ${
                  uploadBanner.kind === 'loading'
                    ? 'bg-paper border-line text-muted'
                    : uploadBanner.kind === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-800'
                }`}
                role="status"
              >
                {uploadBanner.kind === 'loading' && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                {uploadBanner.kind === 'success' && <Check className="h-4 w-4 shrink-0" />}
                {uploadBanner.text}
              </p>
            )}
            {shootError && !uploadBanner && <p className="text-sm text-red-700">{shootError}</p>}
            <button
              type="button"
              disabled={uploading || !eventPublic.uploadsOpen}
              onClick={() => triggerImageUpload()}
              className="w-full border border-ink py-4 text-xs uppercase flex justify-center gap-2 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Загрузка…
                </>
              ) : (
                <>
                  <FileImage className="h-5 w-5" />
                  Выбрать фото
                </>
              )}
            </button>
          </div>
        )}

        {tab === 'feed' && (
          <div className="p-4 max-w-3xl mx-auto">
            <div className="flex justify-between mb-4">
              <p className="text-sm text-muted">{photos.length} фото</p>
              <button type="button" onClick={() => loadFeed()} className="text-xs uppercase border border-line px-3 py-2">
                <RefreshCw className="inline w-4 h-4 mr-1" /> Обновить
              </button>
            </div>
            {feedError && <p className="text-sm text-red-700 mb-3">{feedError}</p>}
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => setLightbox(p)} className="block w-full aspect-square border border-line overflow-hidden">
                    <img src={p.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                  {p.author && <p className="text-[10px] text-muted truncate">{p.author}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/92 flex flex-col p-4" role="dialog" onClick={() => setLightbox(null)}>
          <button type="button" className="self-end text-paper" onClick={() => setLightbox(null)}>
            <X className="w-7 h-7" />
          </button>
          <div className="flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt="" className="max-h-[75dvh] max-w-full object-contain" />
          </div>
          <div className="text-center text-paper/80 mt-4">
            {lightbox.author && <p>{lightbox.author}</p>}
            <button
              type="button"
              disabled={downloadBusy}
              onClick={(e) => {
                e.stopPropagation();
                void handleDownload(lightbox);
              }}
              className="mt-4 inline-flex gap-2 text-xs uppercase"
            >
              {downloadBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Скачать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
