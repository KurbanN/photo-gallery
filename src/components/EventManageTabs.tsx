import { Grid3x3, QrCode, Smartphone } from 'lucide-react';

type TabId = 'guest' | 'gallery' | 'tools';

const TABS: {
  id: TabId;
  label: string;
  shortLabel: string;
  Icon: typeof Grid3x3;
}[] = [
  { id: 'gallery', label: 'Галерея', shortLabel: 'Фото', Icon: Grid3x3 },
  { id: 'tools', label: 'QR и код', shortLabel: 'QR', Icon: QrCode },
  { id: 'guest', label: 'Экран гостя', shortLabel: 'Гость', Icon: Smartphone },
];

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
  galleryCount?: number;
};

export type EventManageTab = TabId;

export default function EventManageTabs({ active, onChange, galleryCount }: Props) {
  const base =
    'flex min-w-0 flex-1 items-center justify-center gap-1 rounded-sm px-1 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] transition-colors sm:gap-2 sm:px-2 sm:py-3.5 sm:text-[11px] sm:tracking-[0.18em]';
  const activeCls = 'bg-ink text-paper';
  const idleCls = 'border border-line bg-paper text-ink hover:border-ink';

  const galleryCountSuffix =
    galleryCount !== undefined ? ` (${galleryCount})` : '';

  return (
    <nav className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl gap-1 px-2 py-2 sm:gap-2 sm:px-4 sm:py-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`${base} ${active === tab.id ? activeCls : idleCls}`}
          >
            <tab.Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            <span className="truncate leading-tight">
              <span className="sm:hidden">
                {tab.shortLabel}
                {tab.id === 'gallery' ? galleryCountSuffix : ''}
              </span>
              <span className="hidden sm:inline">
                {tab.label}
                {tab.id === 'gallery' ? galleryCountSuffix : ''}
              </span>
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
