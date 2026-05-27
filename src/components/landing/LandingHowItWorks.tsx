import { LANDING_STEPS } from '@/content/landing';
import LandingSection from '@/components/landing/LandingSection';

export default function LandingHowItWorks() {
  return (
    <LandingSection
      id="how"
      title="Как это работает"
      subtitle="Три шага от QR на столе до общей галереи воспоминаний."
      className="bg-paper"
    >
      <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
        {LANDING_STEPS.map((item) => (
          <li key={item.step} className="border border-line bg-paper p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3">{item.step}</p>
            <h3 className="font-serif text-xl text-ink mb-2">{item.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{item.text}</p>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}
