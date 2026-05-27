import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LANDING_FAQ } from '@/content/landing';
import LandingSection from '@/components/landing/LandingSection';

export default function LandingFaq() {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(() => new Set());

  const toggle = (index: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <LandingSection id="faq" title="Частые вопросы">
      <ul className="mx-auto max-w-2xl divide-y divide-line border-y border-line">
        {LANDING_FAQ.map((item, index) => {
          const open = openIndexes.has(index);
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-trigger-${index}`;

          return (
            <li key={item.q}>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-start justify-between gap-4 py-6 text-left"
                onClick={() => toggle(index)}
              >
                <span className="min-w-0 font-medium text-ink">{item.q}</span>
                <ChevronDown
                  className={`mt-0.5 size-5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!open}
                className="pb-6 pt-0"
              >
                <p className="text-sm text-muted leading-relaxed">{item.a}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
}
