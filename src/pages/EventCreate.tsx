import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import GuestLoginPreview from '@/components/GuestLoginPreview';
import { DEFAULT_GUEST_SUBTITLE, buildGuestScreenSettings } from '@/lib/event-branding';
import { createEvent, uploadLoginBg } from '@/lib/organizer-api';

export default function EventCreate() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState<'lite' | 'party' | 'premium'>('party');
  const [endsAt, setEndsAt] = useState('');
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(DEFAULT_GUEST_SUBTITLE);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const welcomeManual = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ pin: string; guestUrl: string; id: string } | null>(null);

  useEffect(() => {
    if (!welcomeManual.current) setWelcomeTitle(title);
  }, [title]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  }, [previewBlobUrl]);

  const previewBgUrl = useMemo((): string | null => previewBlobUrl, [previewBlobUrl]);

  const onPickBackground = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Фон: нужен файл изображения (JPG, PNG, WebP)');
      return;
    }
    setError('');
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setPreviewBlobUrl(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setLoading(true);
    setError('');
    try {
      const res = await createEvent({
        title: trimmedTitle,
        slug: slug.trim() || undefined,
        plan,
        endsAt: endsAt || undefined,
        settings: buildGuestScreenSettings(trimmedTitle, welcomeTitle, welcomeSubtitle),
      });
      const bgFile = fileRef.current?.files?.[0];
      if (bgFile) {
        await uploadLoginBg(res.event.id, bgFile);
      }
      setCreated({ pin: res.pin, guestUrl: res.guestUrl, id: res.event.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-dvh p-6 max-w-md mx-auto">
        <h1 className="font-serif text-2xl mb-4">Мероприятие создано</h1>
        <p className="text-sm text-muted mb-2">Ссылка для гостей:</p>
        <p className="text-sm break-all bg-white border border-line p-3 mb-4">{created.guestUrl}</p>
        <p className="text-sm text-muted mb-2">PIN для гостей (сохраните):</p>
        <p className="text-2xl tracking-[0.3em] font-semibold mb-6">{created.pin}</p>
        <Link
          to={`/dashboard/events/${created.id}`}
          className="block text-center bg-ink text-paper py-3 text-xs uppercase"
        >
          Управление и QR
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper pb-12">
      <div className="px-6 py-6 max-w-3xl mx-auto">
        <Link to="/dashboard" className="text-xs uppercase text-muted">
          ← Назад
        </Link>
        <h1 className="font-serif text-2xl mt-4 mb-2">Новое мероприятие</h1>
        <p className="text-sm text-muted mb-8">Сначала настройте экран для гостей — так они увидят его по QR.</p>

        <form onSubmit={submit} className="space-y-10">
          <section className="space-y-4 border-b border-line pb-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Основное</h2>
            <div>
              <label className="text-xs uppercase text-muted">Название мероприятия</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-line px-3 py-2 mt-1"
                placeholder="День рождения Курбан"
              />
            </div>
            <div>
              <label className="text-xs uppercase text-muted">Адрес (slug, необязательно)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ivanova-2026"
                className="w-full border border-line px-3 py-2 mt-1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase text-muted">Тариф</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as 'lite' | 'party' | 'premium')}
                  className="w-full border border-line px-3 py-2 mt-1"
                >
                  <option value="lite">Lite — 300 фото</option>
                  <option value="party">Party — 2000 фото</option>
                  <option value="premium">Premium — 5000 фото</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase text-muted">Окончание приёма фото</label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full border border-line px-3 py-2 mt-1"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted mb-4">Экран входа для гостей</h2>
            <div className="grid gap-8 md:grid-cols-[minmax(0,240px)_1fr]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Предпросмотр</p>
                <GuestLoginPreview
                  bgUrl={previewBgUrl}
                  welcomeTitle={welcomeTitle || title}
                  welcomeSubtitle={welcomeSubtitle}
                  pinRequired
                  className="w-full mx-auto"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase text-muted">Заголовок на экране</label>
                  <input
                    value={welcomeTitle}
                    onChange={(e) => {
                      welcomeManual.current = true;
                      setWelcomeTitle(e.target.value);
                    }}
                    className="w-full border border-line px-3 py-2 mt-1"
                    placeholder={title || 'Как в названии мероприятия'}
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
                <div className="pt-2 border-t border-line">
                  <label className="text-xs uppercase text-muted">Фон (необязательно)</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-sm"
                    onChange={(e) => onPickBackground(e.target.files?.[0])}
                  />
                  <p className="text-[11px] text-muted mt-1">
                    Без файла — нейтральный фон. JPG или PNG, до 8 МБ.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper py-3 text-xs uppercase flex justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Создать мероприятие
          </button>
        </form>
      </div>
    </div>
  );
}
