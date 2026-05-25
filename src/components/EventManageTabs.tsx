import { Grid3x3, QrCode, Smartphone } from 'lucide-react';

type TabId = 'guest' | 'gallery' | 'tools';

const TABS: { id: TabId; label: string; Icon: typeof Grid3x3 }[] = [
  { id: 'gallery', label: 'Галерея', Icon: Grid3x3 },
  { id: 'tools', label: 'QR и код', Icon: QrCode },
  { id: 'guest', label: 'Экран гостя', Icon: Smartphone },
];

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
  galleryCount?: number;
};

export type EventManageTab = TabId;

export default function EventManageTabs({ active, onChange, galleryCount }: Props) {
  const base =
    'flex flex-1 items-center justify-center gap-2 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors';
  const activeCls = 'bg-ink text-paper';
  const idleCls = 'border border-line bg-paper text-ink hover:border-ink';

  return (
    <nav className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2 px-4 py-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`${base} ${active === tab.id ? activeCls : idleCls}`}
          >
            <tab.Icon className="h-4 w-4 shrink-0" />
            <span>
              {tab.label}
              {tab.id === 'gallery' && galleryCount !== undefined ? ` (${galleryCount})` : ''}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
