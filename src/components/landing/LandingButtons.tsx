import { Link } from 'react-router-dom';

const primary =
  'inline-flex items-center justify-center bg-ink text-paper px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-90';
const secondary =
  'inline-flex items-center justify-center border border-ink text-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper';

type Props = {
  className?: string;
  stack?: boolean;
};

export function LandingCtaButtons({ className = '', stack = false }: Props) {
  const layout = stack ? 'flex flex-col gap-3 w-full max-w-xs' : 'flex flex-col sm:flex-row gap-3';

  return (
    <div className={`${layout} ${className}`}>
      <Link to="/dashboard/login" className={`${primary} ${stack ? 'w-full' : 'flex-1 sm:flex-none'}`}>
        Создать мероприятие
      </Link>
      <Link to="/e/demo" className={`${secondary} ${stack ? 'w-full' : 'flex-1 sm:flex-none'}`}>
        Демо-лента
      </Link>
    </div>
  );
}
