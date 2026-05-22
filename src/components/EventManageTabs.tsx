type TabId = 'guest' | 'gallery' | 'tools';

const TABS: { id: TabId; label: string }[] = [
  { id: 'gallery', label: 'Галерея' },
  { id: 'tools', label: 'QR и экспорт' },
  { id: 'guest', label: 'Экран гостя' },
];

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
  galleryCount?: number;
};

export type EventManageTab = TabId;

export default function EventManageTabs({ active, onChange, galleryCount }: Props) {
  return (
    <nav className="flex border-b border-line bg-paper sticky top-0 z-10">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-3 text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors ${
            active === tab.id ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
          }`}
        >
          {tab.label}
          {tab.id === 'gallery' && galleryCount !== undefined ? ` (${galleryCount})` : ''}
        </button>
      ))}
    </nav>
  );
}
