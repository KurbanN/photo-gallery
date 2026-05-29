import { mediaTypeOf } from '@/lib/guest-media';
import type { PhotoEntry } from '@/lib/guest-api';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const SLIDE_MS = 8000;
const UI_HIDE_MS = 4000;

type Props = {
  items: PhotoEntry[];
  eventTitle: string;
  qrDataUrl?: string | null;
};

export default function LiveSlideshow({ items, eventTitle, qrDataUrl }: Props) {
  const slides = useMemo(
    () => items.filter((p) => mediaTypeOf(p) === 'image'),
    [items],
  );

  const [index, setIndex] = useState(0);
  const [uiVisible, setUiVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIds = useRef<Set<string>>(new Set());

  const current = slides[index] ?? null;

  useEffect(() => {
    setIndex((i) => (slides.length === 0 ? 0 : Math.min(i, slides.length - 1)));
  }, [slides.length]);

  useEffect(() => {
    const ids = new Set(slides.map((p) => p.id));
    const added = slides.filter((p) => !prevIds.current.has(p.id));
    prevIds.current = ids;

    if (added.length > 0) {
      const newest = added.reduce((a, b) =>
        new Date(b.createdAt).getTime() > new Date(a.createdAt).getTime() ? b : a,
      );
      const idx = slides.findIndex((p) => p.id === newest.id);
      if (idx >= 0) setIndex(idx);
    }
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const bumpUi = () => {
    setUiVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setUiVisible(false), UI_HIDE_MS);
  };

  useEffect(() => {
    bumpUi();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const onMove = () => bumpUi();
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchstart', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onMove);
    };
  }, []);

  if (slides.length === 0) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-black px-8 text-center text-white">
        <p className="font-serif text-3xl md:text-5xl">{eventTitle}</p>
        <p className="mt-6 text-sm uppercase tracking-[0.35em] text-white/50">
          Ждём первые фото от гостей
        </p>
        {qrDataUrl ? (
          <div className="mt-12 rounded-lg bg-white p-3">
            <img src={qrDataUrl} alt="" className="h-28 w-28 md:h-36 md:w-36" />
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-ink/70">
              Сканируйте, чтобы загрузить
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-black"
      onClick={bumpUi}
      role="presentation"
    >
      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          >
            <motion.img
              src={current.url}
              alt=""
              className="h-full w-full object-contain"
              initial={{ scale: 1.04 }}
              animate={{ scale: 1 }}
              transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
              draggable={false}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 transition-opacity duration-500 ${
          uiVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6">
          <div className="min-w-0 text-left">
            <p className="truncate font-serif text-xl text-white md:text-3xl">{eventTitle}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-white/55">
              {slides.length} фото
              {current?.author ? ` · ${current.author}` : ''}
            </p>
          </div>
          {qrDataUrl ? (
            <div className="hidden shrink-0 rounded-md bg-white/95 p-2 sm:block">
              <img src={qrDataUrl} alt="" className="h-20 w-20 md:h-24 md:w-24" />
              <p className="mt-1 text-center text-[8px] uppercase tracking-[0.15em] text-ink/60">
                Загрузить фото
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
