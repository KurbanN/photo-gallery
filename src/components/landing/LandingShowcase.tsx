import { Link } from 'react-router-dom';
import { LANDING_MOCKUPS, LANDING_SHOWCASE } from '@/content/landing';
import LandingSection from '@/components/landing/LandingSection';
import MockupSlot from '@/components/landing/MockupSlot';
import {
  LandingShowcasePhoneMock,
} from '@/components/landing/LandingPhoneMockupsFallback';

function ShowcaseVisual({
  mockupKey,
  title,
}: {
  mockupKey: (typeof LANDING_SHOWCASE)[number]['mockupKey'];
  title: string;
}) {
  const src = LANDING_MOCKUPS[mockupKey];

  if (src) {
    return <MockupSlot src={src} alt={title} aspect="phone" />;
  }

  if (mockupKey === 'login' || mockupKey === 'gallery') {
    return <LandingShowcasePhoneMock variant={mockupKey} />;
  }

  return <MockupSlot alt={title} aspect="phone" />;
}

export default function LandingShowcase() {
  return (
    <LandingSection
      id="showcase"
      title="Как выглядит у гостей и организатора"
      className="border-y border-line bg-paper"
    >
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {LANDING_SHOWCASE.map((item) => (
          <article key={item.key} className="flex flex-col">
            <ShowcaseVisual mockupKey={item.mockupKey} title={item.title} />
            <h3 className="mt-6 font-serif text-lg text-ink mb-2">{item.title}</h3>
            <p className="text-sm text-muted leading-relaxed flex-1">{item.description}</p>
          </article>
        ))}
      </div>
      <p className="mt-12 text-center">
        <Link
          to="/e/demo"
          className="text-xs uppercase tracking-[0.2em] text-muted hover:text-ink transition-colors"
        >
          Открыть интерактивную демо-ленту →
        </Link>
      </p>
    </LandingSection>
  );
}
