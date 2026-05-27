import type { ReactNode } from 'react';

type Props = {
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
};

export default function LandingSection({
  id,
  title,
  subtitle,
  children,
  className = '',
  headerClassName = '',
}: Props) {
  const titleId = id ? `${id}-title` : undefined;

  return (
    <section id={id} className={`scroll-mt-20 py-16 md:py-24 ${className}`} aria-labelledby={titleId}>
      <div className="mx-auto min-w-0 max-w-6xl px-6">
        {(title || subtitle) && (
          <header className={`mb-10 md:mb-14 mx-auto max-w-2xl text-center ${headerClassName}`}>
            {title && (
              <h2 id={titleId} className="font-serif text-3xl text-ink md:text-4xl mb-3">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-sm text-muted leading-relaxed">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
