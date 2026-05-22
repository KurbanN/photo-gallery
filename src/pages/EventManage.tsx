import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Copy, Download, ExternalLink, Loader2, Trash2, Upload } from 'lucide-react';
import EventManageTabs, { type EventManageTab } from '@/components/EventManageTabs';
import GuestLoginPreview from '@/components/GuestLoginPreview';
import { apiUrl } from '@/lib/api-base';
import { DEFAULT_GUEST_SUBTITLE, buildGuestScreenSettings } from '@/lib/event-branding';
import { resolveBgUrl } from '@/lib/resolve-bg-url';
import {
  deleteAdminEvent,
  deleteOrgPhoto,
  downloadQr,
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
import { createClient } from '@/lib/supabase/client';

const VALID_TABS: EventManageTab[] = ['gallery', 'tools', 'guest'];

function readSettings(raw: EventSettings | undefined, title: string) {
  const s = raw ?? {};
  return {
    welcomeTitle: (s.welcomeTitle as string) || title,
    welcomeSubtitle: (s.welcomeSubtitle as string) || DEFAULT_GUEST_SUBTITLE,
    loginBgUrl: (s.loginBgUrl as string) || '',
  };
}

function parseTab(raw: string | null): EventManageTab {
  if (raw && VALID_TABS.includes(raw as EventManageTab)) return raw as EventManageTab;
  return 'gallery';
}

export default function EventManage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get('tab'));

  const setTab = (next: EventManageTab) => {
    setSearchParams(next === 'gallery' ? {} : { tab: next }, { replace: true });
  };

  const [guestUrl, setGuestUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [pinEnabled, setPinEnabled] = useState(true);
  const [guestPin, setGuestPin] = useState('');
  const [pinDraft, setPinDraft] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [pinMsg, setPinMsg] = useState('');
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [photos, setPhotos] = useState<OrgPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('');
  const [savedLoginBgUrl, setSavedLoginBgUrl] = useState('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [brandingMsg, setBrandingMsg] = useState('');
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

  const saveBrandingText = async () => {
    if (!id) return;
    setBrandingSaving(true);
    setBrandingMsg('');
    try {
      await updateEvent(id, {
        settings: buildGuestScreenSettings(title, welcomeTitle, welcomeSubtitle, savedLoginBgUrl),
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
        settings: buildGuestScreenSettings(title, welcomeTitle, welcomeSubtitle, loginBgUrl),
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
    if (!id || !confirm('Убрать фон? Будет нейтральный экран.')) return;
    setBgUploading(true);
    try {
      await updateEvent(id, {
        settings: buildGuestScreenSettings(title, welcomeTitle, welcomeSubtitle),
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
      setPinMsg('Скопировано');
    } catch {
      setPinMsg('Не удалось скопировать');
    }
  };

  const downloadZip = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const url = apiUrl(`/api/v1/organizer/events/${id}/export.zip`);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert((body as { error?: string }).error || 'Ошибка архива');
      return;
    }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}-photos.zip`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const guestPreviewUrl = guestUrl;

  return (
    <div className="min-h-dvh bg-paper pb-12 flex flex-col">
      <header className="border-b border-line px-6 py-4 shrink-0">
        <Link to="/dashboard" className="text-xs uppercase text-muted">
          ← Мероприятия
        </Link>
        <h1 className="font-serif text-2xl mt-2">{title}</h1>
        <p className="text-xs text-muted mt-1">
          {status} ·{' '}
          <a href={guestUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
            {guestUrl}
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </header>

      <EventManageTabs active={tab} onChange={setTab} galleryCount={photos.length} />

      {error && tab !== 'guest' && <p className="px-6 pt-4 text-red-700 text-sm max-w-3xl mx-auto w-full">{error}</p>}

      <main className="flex-1 max-w-3xl mx-auto w-full">
        {tab === 'guest' && (
          <section className="px-6 py-8">
            <div className="grid gap-8 md:grid-cols-[minmax(0,240px)_1fr]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Предпросмотр</p>
                <GuestLoginPreview
                  bgUrl={previewBgUrl}
                  welcomeTitle={welcomeTitle}
                  welcomeSubtitle={welcomeSubtitle}
                  pinRequired={pinEnabled}
                  className="w-full mx-auto"
                />
                <a
                  href={guestPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block text-center text-[10px] uppercase text-muted underline"
                >
                  Открыть страницу гостя
                </a>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase text-muted">Заголовок на экране</label>
                  <input
                    value={welcomeTitle}
                    onChange={(e) => setWelcomeTitle(e.target.value)}
                    className="w-full border border-line px-3 py-2 mt-1"
                    placeholder={title}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-muted">Подзаголовок</label>
                  <textarea
                    value={welcomeSubtitle}
                    onChange={(e) => setWelcomeSubtitle(e.target.value)}
                    rows={3}
                    className="w-full border border-line px-3 py-2 mt-1 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={brandingSaving}
                  onClick={() => void saveBrandingText()}
                  className="w-full border border-ink py-2 text-xs uppercase disabled:opacity-60"
                >
                  {brandingSaving ? <Loader2 className="inline w-4 h-4 animate-spin" /> : null}
                  Сохранить тексты
                </button>
                <div className="pt-2 border-t border-line">
                  <label className="text-xs uppercase text-muted">Фон (фото)</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-sm"
                    onChange={(e) => onPickBackground(e.target.files?.[0])}
                  />
                  <p className="text-[11px] text-muted mt-1">JPG или PNG, до 8 МБ. Сначала смотрите предпросмотр слева.</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={bgUploading}
                      onClick={() => void applyBackground()}
                      className="flex-1 bg-ink text-paper py-3 text-xs uppercase flex justify-center gap-2 disabled:opacity-60"
                    >
                      {bgUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Сохранить фон
                    </button>
                    {(savedLoginBgUrl || previewBlobUrl) && (
                      <button
                        type="button"
                        disabled={bgUploading}
                        onClick={() => void removeBackground()}
                        className="border border-line px-3 py-3 text-xs uppercase text-muted disabled:opacity-60"
                      >
                        Убрать
                      </button>
                    )}
                  </div>
                </div>
                {brandingMsg && (
                  <p className={`text-sm ${brandingMsg.includes('Ошиб') ? 'text-red-700' : 'text-emerald-800'}`}>
                    {brandingMsg}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === 'gallery' && (
          <section className="px-6 py-8">
            {photos.length === 0 ? (
              <p className="text-sm text-muted text-center py-12">Пока нет фото от гостей.</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p) => (
                  <li key={p.id} className="border border-line">
                    <img src={p.url} alt="" className="aspect-square object-cover w-full" />
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm('Удалить фото?')) return;
                          await deleteOrgPhoto(id, p.id);
                          await load();
                        }}
                        className="w-full text-red-700 py-1 flex justify-center items-center gap-1 text-[10px] uppercase"
                      >
                        <Trash2 className="w-3 h-3" />
                        Удалить
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'tools' && (
          <section className="px-6 py-8 space-y-6">
            <div className="border border-line p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Код для гостей (PIN)</p>
              {guestPin ? (
                <p className="text-3xl tracking-[0.35em] font-semibold text-ink">{guestPin}</p>
              ) : (
                <p className="text-sm text-muted">
                  Код не сохранён в системе (старое мероприятие). Задайте новый ниже — гости смогут входить с ним.
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                <input
                  value={pinDraft}
                  onChange={(e) => setPinDraft(e.target.value)}
                  className="flex-1 min-w-[8rem] border border-line px-3 py-2 text-sm tracking-widest"
                  placeholder="Новый код"
                  autoComplete="off"
                />
                <button
                  type="button"
                  disabled={pinSaving}
                  onClick={() => void savePin()}
                  className="border border-ink px-4 py-2 text-xs uppercase disabled:opacity-60"
                >
                  {pinSaving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null}
                  Сохранить код
                </button>
                {guestPin && (
                  <button
                    type="button"
                    onClick={() => void copyPin()}
                    className="border border-line px-3 py-2 text-xs uppercase flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Копировать
                  </button>
                )}
              </div>
              {pinMsg && (
                <p className={`text-sm ${pinMsg.includes('Ошиб') || pinMsg.includes('Не удал') ? 'text-red-700' : 'text-emerald-800'}`}>
                  {pinMsg}
                </p>
              )}
              {!pinEnabled && <p className="text-xs text-muted">Вход по коду отключён для этого мероприятия.</p>}
            </div>

            <p className="text-sm text-muted">QR для печати, архив всех фото и управление приёмом.</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                type="button"
                onClick={() => downloadQr(id, slug)}
                className="border border-ink px-4 py-3 text-xs uppercase flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Скачать QR PNG
              </button>
              <button
                type="button"
                onClick={() => void downloadZip()}
                className="border border-ink px-4 py-3 text-xs uppercase flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                ZIP все фото
              </button>
            </div>
            <div className="border border-red-200 bg-red-50/50 p-4">
              <p className="text-sm text-ink mb-3">Остановить приём новых фото от гостей. Ленту можно смотреть.</p>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Закрыть приём фото?')) return;
                  await endEvent(id);
                  await load();
                }}
                className="border border-red-800 text-red-800 px-4 py-2 text-xs uppercase"
              >
                Закрыть ленту
              </button>
            </div>

            {profile?.role === 'admin' && (
              <div className="border border-red-300 bg-red-50 p-4">
                <p className="text-sm text-ink mb-3">
                  Удалить мероприятие навсегда: все фото, QR и настройки. Только для администратора.
                </p>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={async () => {
                    if (
                      !confirm(
                        `Удалить «${title}» и все фото? Это нельзя отменить.`,
                      )
                    ) {
                      return;
                    }
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
                  className="bg-red-800 text-paper px-4 py-2 text-xs uppercase flex items-center gap-2 disabled:opacity-60"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Удалить мероприятие
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
