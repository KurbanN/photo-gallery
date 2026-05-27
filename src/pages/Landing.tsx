import { usePageTitle } from '@/lib/brand';
import { LANDING_HERO } from '@/content/landing';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingShowcase from '@/components/landing/LandingShowcase';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingPricing from '@/components/landing/LandingPricing';
import LandingFaq from '@/components/landing/LandingFaq';
import LandingCta from '@/components/landing/LandingCta';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  usePageTitle(LANDING_HERO.title);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingShowcase />
        <LandingFeatures />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
