import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { APP_BRAND } from '@/lib/brand';
import { LANDING_NAV } from '@/content/landing';

export default function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="font-serif text-xl text-ink shrink-0">
          {APP_BRAND}
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Основная навигация">
          {LANDING_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-[10px] uppercase tracking-[0.15em] text-muted hover:text-ink transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/login"
            className="hidden sm:inline-flex bg-ink text-paper px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
          >
            Создать
          </Link>
          <button
            type="button"
            className="md:hidden p-2 text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-line px-6 py-4 flex flex-col gap-3" aria-label="Мобильная навигация">
          {LANDING_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-xs uppercase tracking-[0.15em] text-muted"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/dashboard/login"
            className="mt-2 text-center bg-ink text-paper py-3 text-xs uppercase tracking-[0.15em]"
            onClick={() => setOpen(false)}
          >
            Создать мероприятие
          </Link>
        </nav>
      )}
    </header>
  );
}
