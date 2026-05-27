import { LANDING_FAQ } from '@/content/landing';
import LandingSection from '@/components/landing/LandingSection';

export default function LandingFaq() {
  return (
    <LandingSection id="faq" title="Частые вопросы">
      <dl className="mx-auto max-w-2xl divide-y divide-line border-y border-line">
        {LANDING_FAQ.map((item) => (
          <div key={item.q} className="py-6 first:pt-6">
            <dt className="font-medium text-ink mb-2">{item.q}</dt>
            <dd className="text-sm text-muted leading-relaxed">{item.a}</dd>
          </div>
        ))}
      </dl>
    </LandingSection>
  );
}
