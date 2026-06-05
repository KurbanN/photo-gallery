import { useCallback, useEffect, useRef, useState } from 'react';
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

const MIN_QUERY = 2;
const DEBOUNCE_MS = 280;

export default function FindMySeat() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [meta, setMeta] = useState<SeatsPublic | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SeatSearchResult[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [result, setResult] = useState<SeatLookupResponse | null>(null);
  const [picking, setPicking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const fetchSuggestions = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < MIN_QUERY) {
        setSuggestions([]);
        setNotFound(false);
        setSuggestLoading(false);
        return;
      }
      setSuggestLoading(true);
      setSearchErr('');
      try {
        const { results } = await searchSeats(slug, trimmed);
        setSuggestions(results);
        setNotFound(results.length === 0);
      } catch (e) {
        setSuggestions([]);
        if (e instanceof ApiRequestError && e.status === 429) {
          setSearchErr('Слишком много попыток. Подождите минуту.');
        } else {
          setSearchErr(e instanceof Error ? e.message : 'Ошибка поиска');
        }
      } finally {
        setSuggestLoading(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY) {
      setSuggestions([]);
      setNotFound(false);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(query);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  const pickGuest = async (guestId: string) => {
    setPicking(true);
    setSearchErr('');
    setShowDropdown(false);
    try {
      const data = await lookupSeat(slug, guestId);
      setResult(data);
    } catch (e) {
      setSearchErr(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setPicking(false);
    }
  };

  const onSubmit = () => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY) {
      setSearchErr('Введите минимум 2 буквы');
      return;
    }
    if (suggestions.length === 1 && suggestions[0]) {
      void pickGuest(suggestions[0].id);
      return;
    }
    if (suggestions.length > 1) {
      setShowDropdown(true);
      return;
    }
    setNotFound(true);
    setShowDropdown(true);
  };

  const resetSearch = () => {
    setResult(null);
    setQuery('');
    setSuggestions([]);
    setNotFound(false);
    setShowDropdown(false);
    setSearchErr('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const dropdownOpen =
    showDropdown && query.trim().length >= MIN_QUERY && (suggestLoading || suggestions.length > 0 || notFound);

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
          <p className="mt-3 text-sm leading-relaxed text-muted">{meta.settings.welcomeMessage}</p>
        </header>

        {result ? (
          <div className="mt-10 flex flex-1 flex-col">
            <div className="border border-line bg-white/80 p-6 text-center backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Ваш стол</p>
              <p className="mt-3 font-serif text-6xl text-ink">{result.guest.tableNumber}</p>
              {result.showSeatNumber && result.guest.seatNumber && (
                <p className="mt-4 text-sm text-muted">
                  Место{' '}
                  <span className="font-serif text-lg text-ink">{result.guest.seatNumber}</span>
                </p>
              )}
              <p className="mt-6 font-medium text-ink">{result.guest.fullName}</p>
              <p className="mt-4 text-sm text-muted">{result.welcomeMessage}</p>
            </div>

            {result.tablemates.length > 0 && (
              <div className="mt-6 border border-line bg-white/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">За вашим столом</p>
                <ul className="mt-3 space-y-1 text-sm text-ink">
                  {result.tablemates.map((m) => (
                    <li key={m.id}>{m.fullName}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-muted underline-offset-4 hover:underline"
              onClick={resetSearch}
            >
              Искать снова
            </button>
          </div>
        ) : (
          <div className="mt-10 flex flex-1 flex-col">
            <label className="block">
              <span className="sr-only">Имя или фамилия</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  ref={inputRef}
                  className={`relative z-10 w-full border bg-white py-4 pl-11 pr-4 text-base text-ink outline-none focus:border-ink ${
                    dropdownOpen ? 'border-ink border-b-0' : 'border-line'
                  }`}
                  placeholder="Имя или фамилия"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                    setNotFound(false);
                    setSearchErr('');
                  }}
                  onFocus={() => {
                    if (query.trim().length >= MIN_QUERY) setShowDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowDropdown(false), 180);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSubmit();
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="search"
                  role="combobox"
                  aria-expanded={dropdownOpen}
                  aria-autocomplete="list"
                />

                {dropdownOpen && (
                  <ul
                    className="absolute left-0 right-0 top-full z-20 max-h-64 overflow-y-auto border border-t-0 border-ink bg-white shadow-sm"
                    role="listbox"
                  >
                    {suggestLoading && (
                      <li className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Поиск…
                      </li>
                    )}

                    {!suggestLoading && notFound && (
                      <li className="px-4 py-3 text-sm leading-relaxed text-muted">
                        Никого не нашли. Проверьте написание или спросите организатора.
                      </li>
                    )}

                    {!suggestLoading &&
                      suggestions.map((s) => (
                        <li key={s.id} role="option">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-paper active:bg-paper"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => void pickGuest(s.id)}
                          >
                            <span className="font-medium text-ink">{s.fullName}</span>
                            <span className="ml-3 shrink-0 text-sm text-muted">Стол {s.tableNumber}</span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </label>

            {searchErr && <p className="mt-3 text-center text-sm text-red-700">{searchErr}</p>}

            {!dropdownOpen && notFound && query.trim().length >= MIN_QUERY && !suggestLoading && (
              <p className="mt-4 text-center text-sm leading-relaxed text-muted">
                Мы не нашли гостя с таким именем. Проверьте написание или обратитесь к организатору.
              </p>
            )}

            <button
              type="button"
              disabled={picking || query.trim().length < MIN_QUERY}
              onClick={onSubmit}
              className="mx-auto mt-auto w-full max-w-sm rounded-full bg-ink py-4 text-xs font-semibold uppercase tracking-[0.3em] text-paper disabled:opacity-50"
            >
              {picking ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Загрузка…
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
