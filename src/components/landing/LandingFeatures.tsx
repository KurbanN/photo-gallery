import { LANDING_FEATURES } from '@/content/landing';
import LandingSection from '@/components/landing/LandingSection';

export default function LandingFeatures() {
  return (
    <LandingSection
      id="features"
      title="Возможности"
      subtitle="Всё необходимое для сбора фото с мероприятия — без лишней сложности."
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING_FEATURES.map((f) => (
          <li key={f.title} className="border border-line p-6">
            <h3 className="font-medium text-ink mb-2">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.text}</p>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}
