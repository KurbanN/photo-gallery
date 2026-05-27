import { Heart, RefreshCw } from 'lucide-react';
import type { PhotoEntry } from '@/lib/guest-api';
import type { FeedFilter } from '@/lib/guest-media';
import { mediaTypeOf } from '@/lib/guest-media';

type Props = {
  items: PhotoEntry[];
  filter: FeedFilter;
  favoriteIds: Set<string>;
  feedError: string;
  onRefresh: () => void;
  onOpen: (item: PhotoEntry) => void;
  onToggleFavorite: (id: string) => void;
};

const EMPTY: Record<FeedFilter, string> = {
  photo: 'Пока нет фото — загрузите первые кадры.',
  video: 'Пока нет видео.',
  favorites: 'Отметьте сердечком понравившиеся кадры.',
};

export default function GuestGalleryPanel({
  items,
  filter,
  favoriteIds,
  feedError,
  onRefresh,
  onOpen,
  onToggleFavorite,
}: Props) {
  return (
    <div className="mx-auto max-w-lg px-4 pb-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted">{items.length} в ленте</p>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1 border border-line px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-ink"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Обновить
        </button>
      </div>
      {feedError && <p className="mb-3 text-sm text-red-700">{feedError}</p>}
      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">{EMPTY[filter]}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {items.map((p) => {
            const fav = favoriteIds.has(p.id);
            const isVideo = mediaTypeOf(p) === 'video';
            return (
              <li key={p.id}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => onOpen(p)}
                    className="block aspect-square w-full overflow-hidden border border-line bg-line/30"
                  >
                    {isVideo ? (
                      <div className="relative h-full w-full bg-ink/90">
                        <video
                          src={p.url}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-white/90">
                          ▶ Видео
                        </span>
                      </div>
                    ) : (
                      <img src={p.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(p.id);
                    }}
                    className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm"
                    aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
                  >
                    <Heart
                      className={`block size-4 ${fav ? 'fill-white text-white' : 'text-white/90'}`}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
                {p.author && (
                  <p className="mt-1 truncate text-[10px] text-muted">{p.author}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
