import { LANDING_HERO } from '@/content/landing';
import { LandingCtaButtons } from '@/components/landing/LandingButtons';
import LandingHeroMockup from '@/components/landing/LandingHeroMockup';
import LandingPrice from '@/components/landing/LandingPrice';

export default function LandingHero() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-muted">{LANDING_HERO.useCases}</p>
            <h1 className="font-serif text-4xl text-ink md:text-5xl lg:text-[3.25rem] leading-tight mb-5">
              {LANDING_HERO.title}
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {LANDING_HERO.subtitle}
            </p>
            <LandingPrice size="lg" className="mb-8 justify-center lg:justify-start flex flex-wrap items-baseline gap-y-1" />
            <LandingCtaButtons className="justify-center lg:justify-start" />
          </div>
          <div className="flex justify-center lg:justify-end">
            <LandingHeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
