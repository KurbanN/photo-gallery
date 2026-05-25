import { Camera, Clapperboard, Heart } from 'lucide-react';
import type { FeedFilter } from '@/lib/guest-media';

type Props = {
  active: FeedFilter;
  onChange: (f: FeedFilter) => void;
};

const ITEMS: { id: FeedFilter; label: string; Icon: typeof Camera }[] = [
  { id: 'photo', label: 'Фото', Icon: Camera },
  { id: 'video', label: 'Видео', Icon: Clapperboard },
  { id: 'favorites', label: 'Избранное', Icon: Heart },
];

export default function GuestBottomNav({ active, onChange }: Props) {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-paper/98 px-6 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg justify-around">
        {ITEMS.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${
                on ? 'text-ink' : 'text-muted'
              }`}
            >
              <Icon className={`h-5 w-5 ${on ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
