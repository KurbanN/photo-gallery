import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Loader2,
  X,
} from 'lucide-react';
import type { PhotoEntry } from '@/lib/guest-api';
import { mediaTypeOf } from '@/lib/guest-media';

type Props = {
  items: PhotoEntry[];
  index: number;
  favoriteIds: Set<string>;
  downloadBusy: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (item: PhotoEntry) => void;
};

const SWIPE_MIN_PX = 48;

export default function GuestMediaLightbox({
  items,
  index,
  favoriteIds,
  downloadBusy,
  onClose,
  onIndexChange,
  onToggleFavorite,
  onDownload,
}: Props) {
  const item = items[index];
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const goPrev = useCallback(() => {
    if (items.length <= 1) return;
    onIndexChange((index - 1 + items.length) % items.length);
  }, [index, items.length, onIndexChange]);

  const goNext = useCallback(() => {
    if (items.length <= 1) return;
    onIndexChange((index + 1) % items.length);
  }, [index, items.length, onIndexChange]);

  useEffect(() => {
    setDragOffset(0);
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goPrev, goNext]);

  if (!item) return null;

  const isVideo = mediaTypeOf(item) === 'video';
  const isFav = favoriteIds.has(item.id);
  const hasMultiple = items.length > 1;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
    const dy = (e.touches[0]?.clientY ?? 0) - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragOffset(dx);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;
    setDragOffset(0);
    if (Math.abs(dx) >= SWIPE_MIN_PX) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/96"
      role="dialog"
      aria-modal
      aria-label="Просмотр фото"
    >
      <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/70">
          {index + 1} / {items.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white/90 hover:bg-white/10"
          aria-label="Закрыть"
        >
          <X className="h-7 w-7" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        {hasMultiple && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm"
            aria-label="Предыдущее"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}

        <div
          className="flex h-full w-full max-w-3xl items-center justify-center touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            transform: dragOffset ? `translateX(${dragOffset * 0.35}px)` : undefined,
            transition: dragOffset ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {isVideo ? (
            <video
              key={item.id}
              src={item.url}
              controls
              playsInline
              className="max-h-[62dvh] max-w-full"
            />
          ) : (
            <img
              key={item.id}
              src={item.url}
              alt=""
              className="max-h-[62dvh] max-w-full select-none object-contain"
              draggable={false}
            />
          )}
        </div>

        {hasMultiple && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm"
            aria-label="Следующее"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        )}
      </div>

      {hasMultiple && (
        <div className="flex shrink-0 gap-1.5 overflow-x-auto px-4 py-2 scrollbar-thin">
          {items.map((p, i) => {
            const thumbVideo = mediaTypeOf(p) === 'video';
            const active = i === index;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onIndexChange(i)}
                className={`h-14 w-14 shrink-0 overflow-hidden border-2 ${
                  active ? 'border-white' : 'border-transparent opacity-60'
                }`}
              >
                {thumbVideo ? (
                  <span className="flex h-full w-full items-center justify-center bg-ink text-[8px] text-white">
                    ▶
                  </span>
                ) : (
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-6 border-t border-white/10 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => onToggleFavorite(item.id)}
          className="flex flex-col items-center gap-1 text-white/90"
          aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
        >
          <Heart
            className={`h-6 w-6 ${isFav ? 'fill-red-500 text-red-500' : ''}`}
            strokeWidth={1.5}
          />
          <span className="text-[10px] uppercase tracking-[0.12em]">
            {isFav ? 'В избранном' : 'В избранное'}
          </span>
        </button>

        <button
          type="button"
          disabled={downloadBusy}
          onClick={() => onDownload(item)}
          className="flex flex-col items-center gap-1 text-white/90 disabled:opacity-50"
        >
          {downloadBusy ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Download className="h-6 w-6" strokeWidth={1.5} />
          )}
          <span className="text-[10px] uppercase tracking-[0.12em]">Скачать</span>
        </button>
      </div>

      {item.author && (
        <p className="pb-3 text-center text-sm text-white/70">{item.author}</p>
      )}
    </div>
  );
}
