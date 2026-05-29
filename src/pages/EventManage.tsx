import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Archive, Copy, ExternalLink, Grid3x3, Loader2, Monitor, Trash2, Upload } from 'lucide-react';
import EventManageTabs, { type EventManageTab } from '@/components/EventManageTabs';
import GuestLoginPreview from '@/components/GuestLoginPreview';
import QrPrintCardSection from '@/components/QrPrintCardSection';
import {
  BtnPrimary,
  BtnSecondary,
  OrganizerField,
  OrganizerHeader,
  OrganizerPageShell,
  OrganizerSection,
  StatusMessage,
  inputClass,
  textareaClass,
} from '@/components/organizer/organizer-ui';
import { usePageTitle } from '@/lib/brand';
import { DEFAULT_GUEST_SUBTITLE, buildGuestScreenSettings, readQrCardVariant } from '@/lib/event-branding';
import type { QrCardVariant } from '@/lib/qr-card-variants';
import { liveDisplayUrl } from '@/lib/app-url';
import { resolveBgUrl } from '@/lib/resolve-bg-url';
import {
  deleteAdminEvent,
  deleteOrgPhoto,
  downloadEventPhotosZip,
  endEvent,
  fetchMe,
  getEvent,
  listEventPhotos,
  updateEvent,
  uploadLoginBg,
  type EventSettings,
  type OrgPhoto,
  type OrganizerProfile,
} from '@/lib/organizer-api';

const VALID_TABS: EventManageTab[] = ['gallery', 'tools', 'guest'];

function readSettings(raw: EventSettings | undefined, title: string) {
  const s = raw ?? {};
  return {
    welcomeTitle: (s.welcomeTitle as string) || title,
    welcomeSubtitle: (s.welcomeSubtitle as string) || DEFAULT_GUEST_SUBTITLE,
    loginBgUrl: (s.loginBgUrl as string) || '',
    qrCardVariant: readQrCardVariant(s),
  };
}

function parseTab(raw: string | null): EventManageTab {
  if (raw && VALID_TABS.includes(raw as EventManageTab)) return raw as EventManageTab;
  return 'gallery';
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|m4v|3gp)(\?|$)/i.test(url);
}

function PinDisplay({ code }: { code: string }) {
  const digits = code.padEnd(4, ' ').slice(0, 4).split('');
  return (
    <div className="flex justify-center gap-2 sm:justify-start">
      {digits.map((d, i) => (
        <span
          key={i}
          className="flex h-14 w-11 items-center justify-center border border-line bg-paper font-semibold text-xl tracking-widest text-ink sm:h-16 sm:w-12"
        >
          {d.trim() || '·'}
        </span>
      ))}
    </div>
  );
}

export default function EventManage() {
  const { id = '' } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  usePageTitle(title || undefined);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get('tab'));

  const setTab = (next: EventManageTab) => {
    setSearchParams(next === 'gallery' ? {} : { tab: next }, { replace: true });
  };

  const [guestUrl, setGuestUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('');
  const [pinEnabled, setPinEnabled] = useState(true);
  const [guestPin, setGuestPin] = useState('');
  const [pinDraft, setPinDraft] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [pinMsg, setPinMsg] = useState('');
  const [liveMsg, setLiveMsg] = useState('');
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [photos, setPhotos] = useState<OrgPhoto[]>([]);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipMsg, setZipMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('');
  const [savedLoginBgUrl, setSavedLoginBgUrl] = useState('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [brandingMsg, setBrandingMsg] = useState('');
  const [qrCardVariant, setQrCardVariant] = useState<QrCardVariant>('classic');
  const [variantSaving, setVariantSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewBgUrl = useMemo((): string | null => {
    if (previewBlobUrl) return previewBlobUrl;
    return resolveBgUrl(savedLoginBgUrl);
  }, [previewBlobUrl, savedLoginBgUrl]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [me, { event, guestUrl: url }] = await Promise.all([fetchMe(), getEvent(id)]);
      setProfile(me);
      setGuestUrl(url);
      setSlug(event.slug);
      setTitle(event.title);
      setStatus(event.status);
      setPinEnabled(event.pin_enabled !== false);
      const pin = event.pin ?? '';
      setGuestPin(pin);
      setPinDraft(pin);
      const branding = readSettings(event.settings, event.title);
      setWelcomeTitle(branding.welcomeTitle);
      setWelcomeSubtitle(branding.welcomeSubtitle);
      setSavedLoginBgUrl(branding.loginBgUrl);
      setQrCardVariant(branding.qrCardVariant);
      setPreviewBlobUrl(null);
      setPhotos(await listEventPhotos(id));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  }, [previewBlobUrl]);

  const onPickBackground = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setBrandingMsg('Нужен файл изображения (JPG, PNG, WebP)');
      return;
    }
    setBrandingMsg('');
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setPreviewBlobUrl(URL.createObjectURL(file));
  };

  const brandingSettingsExtras = useMemo(
    () => ({ loginBgUrl: savedLoginBgUrl || undefined, qrCardVariant }),
    [savedLoginBgUrl, qrCardVariant],
  );

  const saveBrandingText = async () => {
    if (!id) return;
    setBrandingSaving(true);
    setBrandingMsg('');
    try {
      await updateEvent(id, {
        settings: buildGuestScreenSettings(title, welcomeTitle, welcomeSubtitle, brandingSettingsExtras),
      });
      setBrandingMsg('Тексты сохранены');
    } catch (e) {
      setBrandingMsg(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setBrandingSaving(false);
    }
  };

  const applyBackground = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setBrandingMsg('Сначала выберите файл');
      return;
    }
    if (!id) return;
    setBgUploading(true);
    setBrandingMsg('');
    try {
      const { loginBgUrl } = await uploadLoginBg(id, file);
      await updateEvent(id, {
        settings: buildGuestScreenSettings(title, welcomeTitle, welcomeSubtitle, {
          loginBgUrl,
          qrCardVariant,
        }),
      });
      setSavedLoginBgUrl(loginBgUrl);
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
      if (fileRef.current) fileRef.current.value = '';
      setBrandingMsg('Фон сохранён — гости увидят его на экране входа');
    } catch (e) {
      setBrandingMsg(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setBgUploading(false);
    }
  };

  const removeBackground = async () => {
    if (!id || !confirm('Убрать фон? Будет тёмный экран входа.')) return;
    setBgUploading(true);
    try {
      await updateEvent(id, {
        settings: {
          ...buildGuestScreenSettings(title, welcomeTitle, welcomeSubtitle, { qrCardVariant }),
          loginBgUrl: '',
        },
      });
      setSavedLoginBgUrl('');
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
      if (fileRef.current) fileRef.current.value = '';
      setBrandingMsg('Фон убран');
    } catch (e) {
      setBrandingMsg(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setBgUploading(false);
    }
  };

  const saveQrCardVariant = async (next: QrCardVariant) => {
    if (!id || next === qrCardVariant) return;
    setVariantSaving(true);
    const prev = qrCardVariant;
    setQrCardVariant(next);
    try {
      await updateEvent(id, {
        settings: buildGuestScreenSettings(title, welcomeTitle, welcomeSubtitle, {
          loginBgUrl: savedLoginBgUrl || undefined,
          qrCardVariant: next,
        }),
      });
    } catch (e) {
      setQrCardVariant(prev);
      alert(e instanceof Error ? e.message : 'Не удалось сохранить дизайн');
    } finally {
      setVariantSaving(false);
    }
  };

  const savePin = async () => {
    if (!id) return;
    const next = pinDraft.trim();
    if (!next) {
      setPinMsg('Введите код для гостей');
      return;
    }
    setPinSaving(true);
    setPinMsg('');
    try {
      const updated = await updateEvent(id, { pin: next });
      setGuestPin(updated.pin ?? next);
      setPinDraft(updated.pin ?? next);
      setPinEnabled(updated.pin_enabled !== false);
      setPinMsg('Код сохранён');
    } catch (e) {
      setPinMsg(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setPinSaving(false);
    }
  };

  const copyPin = async () => {
    if (!guestPin) return;
    try {
      await navigator.clipboard.writeText(guestPin);
      setPinMsg('Код скопирован');
    } catch {
      setPinMsg('Не удалось скопировать');
    }
  };

  const liveUrl = slug ? liveDisplayUrl(slug) : '';

  const copyLiveUrl = async () => {
    if (!liveUrl) return;
    try {
      await navigator.clipboard.writeText(liveUrl);
      setLiveMsg('Ссылка для экрана скопирована');
    } catch {
      setLiveMsg('Не удалось скопировать');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  const pageMeta = (
    <>
      <span className="uppercase tracking-[0.12em]">{status}</span>
      {' · '}
      <a
        href={guestUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-ink underline decoration-line hover:decoration-ink"
      >
        /e/{slug}
        <ExternalLink className="h-3 w-3" />
      </a>
    </>
  );

  return (
    <OrganizerPageShell>
      <OrganizerHeader backTo="/dashboard" backLabel="Мероприятия" title={title} meta={pageMeta} />

      <EventManageTabs active={tab} onChange={setTab} galleryCount={photos.length} />

      {error && tab !== 'guest' && (
        <p className="mx-auto max-w-3xl px-4 pt-4 text-sm text-red-700">{error}</p>
      )}

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        {tab === 'gallery' && (
          <div className="space-y-4">
            {liveUrl ? (
              <OrganizerSection title="Экран в зале">
                <p className="text-sm text-muted">
                  Откройте на телевизоре или проекторе в ресторане — новые фото гостей будут появляться
                  автоматически. Используйте тот же PIN, что и для гостей.
                </p>
                <p className="mt-3 break-all rounded-lg border border-line/60 bg-paper px-3 py-2 font-mono text-xs text-ink">
                  {liveUrl}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-paper"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    Открыть экран
                  </a>
                  <BtnSecondary onClick={() => void copyLiveUrl()} className="!w-auto">
                    <Copy className="mr-1 inline h-3.5 w-3.5" />
                    Копировать ссылку
                  </BtnSecondary>
                </div>
                {liveMsg ? <p className="mt-2 text-xs text-muted">{liveMsg}</p> : null}
              </OrganizerSection>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                <Grid3x3 className="mr-1 inline h-3.5 w-3.5" />
                {photos.length} в галерее
              </p>
              <div className="flex flex-wrap gap-2">
                {photos.length > 0 ? (
                  <BtnSecondary
                    disabled={zipBusy}
                    onClick={() => {
                      setZipMsg('');
                      setZipBusy(true);
                      void downloadEventPhotosZip(id, slug)
                        .then(() => setZipMsg('Архив скачан'))
                        .catch((e) =>
                          setZipMsg(e instanceof Error ? e.message : 'Не удалось скачать архив'),
                        )
                        .finally(() => setZipBusy(false));
                    }}
                    className="!w-auto !py-2"
                  >
                    {zipBusy ? (
                      <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Archive className="mr-1 inline h-3.5 w-3.5" />
                    )}
                    {zipBusy ? 'Собираем архив…' : 'Все фото (ZIP)'}
                  </BtnSecondary>
                ) : null}
                <BtnSecondary onClick={() => void load()} className="!w-auto !py-2">
                  Обновить
                </BtnSecondary>
              </div>
            </div>
            {zipMsg ? <p className="text-xs text-muted">{zipMsg}</p> : null}

            {photos.length === 0 ? (
              <div className="border border-dashed border-line px-6 py-16 text-center">
                <p className="font-serif text-lg text-ink">Пока пусто</p>
                <p className="mt-2 text-sm text-muted">
                  Когда гости загрузят фото, они появятся здесь и в общей ленте.
                </p>
                <a
                  href={guestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block text-[10px] uppercase tracking-[0.2em] text-ink underline"
                >
                  Открыть страницу гостя
                </a>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((p) => {
                  const video = isVideoUrl(p.url);
                  return (
                    <li key={p.id} className="group border border-line bg-paper">
                      <div className="relative aspect-square overflow-hidden bg-line/30">
                        {video ? (
                          <>
                            <video src={p.url} className="h-full w-full object-cover" muted preload="metadata" />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-[10px] uppercase tracking-[0.2em] text-white">
                              Видео
                            </span>
                          </>
                        ) : (
                          <img src={p.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm('Удалить из галереи?')) return;
                          await deleteOrgPhoto(id, p.id);
                          await load();
                        }}
                        className="flex w-full items-center justify-center gap-1 py-2 text-[10px] uppercase tracking-[0.15em] text-red-700 opacity-80 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                        Удалить
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {tab === 'guest' && (
          <div className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr]">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted">Предпросмотр входа</p>
                <GuestLoginPreview
                  bgUrl={previewBgUrl}
                  welcomeTitle={welcomeTitle}
                  welcomeSubtitle={welcomeSubtitle}
                  pinRequired={pinEnabled}
                  pinPreview={pinDraft || guestPin || '1234'}
                  className="mx-auto w-full max-w-[220px]"
                />
                <a
                  href={guestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block text-center text-[10px] uppercase tracking-[0.15em] text-muted underline hover:text-ink"
                >
                  Открыть как гость
                </a>
              </div>

              <div className="space-y-6">
                <OrganizerSection title="Тексты на экране входа">
                  <OrganizerField label="Заголовок">
                    <input
                      value={welcomeTitle}
                      onChange={(e) => setWelcomeTitle(e.target.value)}
                      className={inputClass}
                      placeholder={title}
                    />
                  </OrganizerField>
                  <OrganizerField label="Подзаголовок">
                    <textarea
                      value={welcomeSubtitle}
                      onChange={(e) => setWelcomeSubtitle(e.target.value)}
                      rows={3}
                      className={textareaClass}
                    />
                  </OrganizerField>
                  <BtnPrimary disabled={brandingSaving} onClick={() => void saveBrandingText()}>
                    {brandingSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Сохранить тексты
                  </BtnPrimary>
                </OrganizerSection>

                <OrganizerSection
                  title="Фон экрана входа"
                  description="Как на свадебном макете: фото на весь экран с затемнением. JPG или PNG, до 8 МБ."
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-[10px] file:uppercase file:tracking-[0.1em] file:text-paper"
                    onChange={(e) => onPickBackground(e.target.files?.[0])}
                  />
                  <div className="flex flex-wrap gap-2">
                    <BtnPrimary disabled={bgUploading} onClick={() => void applyBackground()} className="flex-1">
                      {bgUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Сохранить фон
                    </BtnPrimary>
                    {(savedLoginBgUrl || previewBlobUrl) && (
                      <BtnSecondary disabled={bgUploading} onClick={() => void removeBackground()}>
                        Убрать фон
                      </BtnSecondary>
                    )}
                  </div>
                </OrganizerSection>

                {brandingMsg && (
                  <StatusMessage
                    text={brandingMsg}
                    error={brandingMsg.includes('Ошиб') || brandingMsg.includes('ошиб')}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'tools' && (
          <div className="space-y-6">
            <OrganizerSection
              title="Код для гостей"
              description="Гости вводят код на экране «Закрытый альбом». Напечатайте его на QR-карточке."
            >
              {guestPin ? (
                <PinDisplay code={pinDraft || guestPin} />
              ) : (
                <p className="text-sm text-muted">Задайте код ниже — он появится на карточке и у гостей.</p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <input
                  value={pinDraft}
                  onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className={`${inputClass} sm:max-w-[10rem] tracking-[0.35em]`}
                  placeholder="0000"
                  inputMode="numeric"
                  autoComplete="off"
                />
                <BtnSecondary disabled={pinSaving} onClick={() => void savePin()}>
                  {pinSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Сохранить код
                </BtnSecondary>
                {guestPin && (
                  <BtnSecondary onClick={() => void copyPin()}>
                    <Copy className="h-3.5 w-3.5" />
                    Копировать
                  </BtnSecondary>
                )}
              </div>
              {pinMsg && (
                <StatusMessage
                  text={pinMsg}
                  error={pinMsg.includes('Ошиб') || pinMsg.includes('Не удал')}
                />
              )}
              {!pinEnabled && (
                <p className="text-xs text-amber-800">Вход по коду отключён для этого мероприятия.</p>
              )}
            </OrganizerSection>

            {guestUrl && (
              <OrganizerSection title="QR-карточка для столов">
                <QrPrintCardSection
                  eventId={id}
                  slug={slug}
                  guestUrl={guestUrl}
                  eventTitle={title}
                  welcomeTitle={welcomeTitle}
                  welcomeSubtitle={welcomeSubtitle}
                  guestPin={guestPin}
                  pinEnabled={pinEnabled}
                  bgUrl={previewBgUrl}
                  variant={qrCardVariant}
                  onVariantChange={saveQrCardVariant}
                  variantSaving={variantSaving}
                />
              </OrganizerSection>
            )}

            <OrganizerSection
              title="Закрыть приём файлов"
              description="Гости не смогут загружать новые фото и видео. Галерею можно смотреть."
              className="border-amber-200 bg-amber-50/40"
            >
              <BtnSecondary
                onClick={async () => {
                  if (!confirm('Закрыть приём фото и видео от гостей?')) return;
                  await endEvent(id);
                  await load();
                }}
                className="!border-amber-800 !text-amber-900"
              >
                Закрыть ленту
              </BtnSecondary>
            </OrganizerSection>

            {profile?.role === 'admin' && (
              <OrganizerSection
                title="Удалить мероприятие"
                description="Все фото, QR и настройки будут удалены безвозвратно."
                className="border-red-200 bg-red-50/50"
              >
                <button
                  type="button"
                  disabled={deleting}
                  onClick={async () => {
                    if (!confirm(`Удалить «${title}» и все файлы? Это нельзя отменить.`)) return;
                    setDeleting(true);
                    try {
                      await deleteAdminEvent(id);
                      navigate('/dashboard', { replace: true });
                    } catch (e) {
                      alert(e instanceof Error ? e.message : 'Ошибка удаления');
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-paper disabled:opacity-50 sm:w-auto"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Удалить навсегда
                </button>
              </OrganizerSection>
            )}
          </div>
        )}
      </main>
    </OrganizerPageShell>
  );
}
