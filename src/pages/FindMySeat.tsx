import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { ApiRequestError } from '@/lib/api';
import { guestEventPath } from '@/lib/app-url';
import { usePageTitle } from '@/lib/brand';
import { formatEventDateShort } from '@/lib/format-event-date';
import {
  fetchSeatsPublic,
  lookupSeat,
  searchSeats,
  type SeatLookupResponse,
  type SeatSearchResult,
  type SeatsPublic,
} from '@/lib/guest-seats-api';
import { resolveBgUrl } from '@/lib/resolve-bg-url';

type ViewState =
  | { kind: 'search' }
  | { kind: 'ambiguous'; results: SeatSearchResult[] }
  | { kind: 'result'; data: SeatLookupResponse }
  | { kind: 'not_found' };

export default function FindMySeat() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [meta, setMeta] = useState<SeatsPublic | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [view, setView] = useState<ViewState>({ kind: 'search' });

  const welcomeTitle = meta?.settings.welcomeTitle ?? 'Мероприятие';
  usePageTitle(meta ? `${welcomeTitle} — место` : undefined);
  const dateShort = formatEventDateShort(meta?.startsAt ?? meta?.endsAt);
  const bgUrl = resolveBgUrl(meta?.settings.loginBgUrl);

  useEffect(() => {
    if (!slug) return;
    fetchSeatsPublic(slug)
      .then(setMeta)
      .catch((e) => setLoadErr(e instanceof Error ? e.message : 'Не найдено'));
  }, [slug]);

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 2) {
        setSearchErr('Введите минимум 2 буквы');
        return;
      }
      setSearchErr('');
      setSearching(true);
      try {
        const { results, status } = await searchSeats(slug, trimmed);
        if (status === 'found' && results[0]) {
          const data = await lookupSeat(slug, results[0].id);
          setView({ kind: 'result', data });
        } else if (results.length > 1) {
          setView({ kind: 'ambiguous', results });
        } else {
          setView({ kind: 'not_found' });
        }
      } catch (e) {
        if (e instanceof ApiRequestError && e.status === 429) {
          setSearchErr('Слишком много попыток. Подождите минуту.');
        } else {
          setSearchErr(e instanceof Error ? e.message : 'Ошибка поиска');
        }
      } finally {
        setSearching(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    if (query.trim().length < 2) return;
    const t = setTimeout(() => {
      void searchSeats(slug, query.trim())
        .then(({ results }) => {
          if (view.kind === 'result') return;
          if (results.length > 1) setView({ kind: 'ambiguous', results });
          else if (results.length === 0) setView({ kind: 'search' });
        })
        .catch(() => {});
    }, 350);
    return () => clearTimeout(t);
  }, [query, slug, view.kind]);

  const pickGuest = async (guestId: string) => {
    setSearching(true);
    setSearchErr('');
    try {
      const data = await lookupSeat(slug, guestId);
      setView({ kind: 'result', data });
    } catch (e) {
      setSearchErr(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSearching(false);
    }
  };

  const suggestions = useMemo(() => {
    if (view.kind !== 'ambiguous') return [];
    return view.results;
  }, [view]);

  if (loadErr) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper px-6 text-center">
        <p className="text-muted">{loadErr}</p>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!meta.enabled) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center">
        <p className="font-serif text-3xl text-ink">{welcomeTitle}</p>
        <p className="mt-4 text-sm text-muted">Рассадка пока не опубликована</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-paper">
      {bgUrl && (
        <>
          <div
            className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${bgUrl})` }}
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-paper/85" aria-hidden />
        </>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <header className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted">
            {welcomeTitle}
          </p>
          {dateShort && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted/80">{dateShort}</p>
          )}
          <h1 className="mt-6 font-serif text-4xl text-ink">Найдите своё место</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {meta.settings.welcomeMessage}
          </p>
        </header>

        {view.kind === 'result' ? (
          <div className="mt-10 flex flex-1 flex-col">
            <div className="border border-line bg-white/80 p-6 text-center backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Ваш стол</p>
              <p className="mt-3 font-serif text-6xl text-ink">{view.data.guest.tableNumber}</p>
              {view.data.showSeatNumber && view.data.guest.seatNumber && (
                <p className="mt-4 text-sm text-muted">
                  Место <span className="font-serif text-lg text-ink">{view.data.guest.seatNumber}</span>
                </p>
              )}
              <p className="mt-6 font-medium text-ink">{view.data.guest.fullName}</p>
              <p className="mt-4 text-sm text-muted">{view.data.welcomeMessage}</p>
            </div>

            {view.data.tablemates.length > 0 && (
              <div className="mt-6 border border-line bg-white/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">За вашим столом</p>
                <ul className="mt-3 space-y-1 text-sm text-ink">
                  {view.data.tablemates.map((m) => (
                    <li key={m.id}>{m.fullName}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-muted underline-offset-4 hover:underline"
              onClick={() => {
                setView({ kind: 'search' });
                setQuery('');
              }}
            >
              Искать снова
            </button>
          </div>
        ) : (
          <div className="mt-10 flex flex-1 flex-col">
            <label className="block">
              <span className="sr-only">Имя или фамилия</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="w-full border border-line bg-white py-4 pl-11 pr-4 text-base text-ink outline-none focus:border-ink"
                  placeholder="Имя или фамилия"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setView({ kind: 'search' });
                    setSearchErr('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void runSearch(query);
                  }}
                  autoComplete="name"
                  autoCorrect="off"
                  inputMode="search"
                />
              </div>
            </label>

            {searchErr && <p className="mt-3 text-center text-sm text-red-700">{searchErr}</p>}

            {view.kind === 'not_found' && (
              <p className="mt-6 text-center text-sm leading-relaxed text-muted">
                Мы не нашли гостя с таким именем. Проверьте написание или обратитесь к организатору.
              </p>
            )}

            {suggestions.length > 0 && (
              <ul className="mt-4 divide-y divide-line border border-line bg-white">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-paper"
                      onClick={() => void pickGuest(s.id)}
                    >
                      <span className="font-medium text-ink">{s.fullName}</span>
                      <span className="text-sm text-muted">Стол {s.tableNumber}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              disabled={searching || query.trim().length < 2}
              onClick={() => void runSearch(query)}
              className="mx-auto mt-auto w-full max-w-sm rounded-full bg-ink py-4 text-xs font-semibold uppercase tracking-[0.3em] text-paper disabled:opacity-50"
            >
              {searching ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Поиск…
                </span>
              ) : (
                'Найти'
              )}
            </button>
          </div>
        )}

        <Link
          to={guestEventPath(slug)}
          className="mt-8 block text-center text-[10px] uppercase tracking-[0.25em] text-muted hover:text-ink"
        >
          Открыть альбом фото
        </Link>
      </div>
    </div>
  );
}
