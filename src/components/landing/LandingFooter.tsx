import { Link } from 'react-router-dom';
import { APP_BRAND } from '@/lib/brand';
import { LANDING_CONTACT, LANDING_NAV } from '@/content/landing';

export default function LandingFooter() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
        <div>
          <p className="font-serif text-lg text-ink mb-2">{APP_BRAND}</p>
          <p className="text-sm text-muted max-w-xs">Живая фото-лента для мероприятий. Казахстан.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Подвал">
          {LANDING_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-[10px] uppercase tracking-[0.15em] text-muted hover:text-ink"
            >
              {item.label}
            </a>
          ))}
          <Link to="/e/demo" className="text-[10px] uppercase tracking-[0.15em] text-muted hover:text-ink">
            Демо
          </Link>
          <Link to="/dashboard/login" className="text-[10px] uppercase tracking-[0.15em] text-muted hover:text-ink">
            Кабинет
          </Link>
        </nav>
        <p className="text-sm text-muted">
          <a href={LANDING_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-ink hover:underline">
            {LANDING_CONTACT.whatsappLabel}
          </a>
        </p>
      </div>
      <p className="mx-auto max-w-6xl px-6 mt-8 text-[10px] text-muted">
        © {new Date().getFullYear()} {APP_BRAND}
      </p>
    </footer>
  );
}
