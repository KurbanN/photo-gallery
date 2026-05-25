import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

type Props = {
  title: string;
  dateLabel: string | null;
  homeTo?: string;
  onHomeClick?: () => void;
};

export default function GuestEventHeader({ title, dateLabel, homeTo, onHomeClick }: Props) {
  const homeClass =
    'flex items-center gap-1 rounded-full border border-line/80 px-3 py-1.5 text-muted transition-colors hover:border-ink hover:text-ink';

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-serif text-xl text-ink">{title}</h1>
          {dateLabel && (
            <p className="mt-0.5 text-xs text-muted">{dateLabel}</p>
          )}
        </div>
        {homeTo ? (
          <Link to={homeTo} className={homeClass} aria-label="На главную">
            <Home className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-[0.12em]">Главная</span>
          </Link>
        ) : (
          <button type="button" onClick={onHomeClick} className={homeClass} aria-label="На главную">
            <Home className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-[0.12em]">Главная</span>
          </button>
        )}
      </div>
    </header>
  );
}
