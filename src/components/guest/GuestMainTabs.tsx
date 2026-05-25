import { Grid3x3, Upload } from 'lucide-react';

export type GuestMainTab = 'gallery' | 'upload';

type Props = {
  active: GuestMainTab;
  onChange: (tab: GuestMainTab) => void;
};

export default function GuestMainTabs({ active, onChange }: Props) {
  const base =
    'flex flex-1 items-center justify-center gap-2 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors';
  const activeCls = 'bg-ink text-paper';
  const idleCls = 'border border-line bg-paper text-ink';

  return (
    <nav className="mx-auto grid w-full max-w-lg grid-cols-2 gap-2 px-4 py-3">
      <button
        type="button"
        onClick={() => onChange('gallery')}
        className={`${base} ${active === 'gallery' ? activeCls : idleCls}`}
      >
        <Grid3x3 className="h-4 w-4" />
        Галерея
      </button>
      <button
        type="button"
        onClick={() => onChange('upload')}
        className={`${base} ${active === 'upload' ? activeCls : idleCls}`}
      >
        <Upload className="h-4 w-4" />
        Загрузить
      </button>
    </nav>
  );
}
