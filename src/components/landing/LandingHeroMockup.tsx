import { LANDING_MOCKUPS } from '@/content/landing';
import MockupSlot from '@/components/landing/MockupSlot';
import { LandingHeroPhoneMockups } from '@/components/landing/LandingPhoneMockupsFallback';

export default function LandingHeroMockup() {
  if (LANDING_MOCKUPS.hero) {
    return (
      <MockupSlot
        src={LANDING_MOCKUPS.hero}
        alt="Живая лента фото с мероприятия"
        aspect="phone"
        className="max-w-[min(100%,300px)] lg:max-w-[340px]"
      />
    );
  }
  return <LandingHeroPhoneMockups />;
}
