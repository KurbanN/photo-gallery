import { LANDING_CONTACT } from '@/content/landing';
import { LandingCtaButtons } from '@/components/landing/LandingButtons';

export default function LandingCta() {
  return (
    <section className="bg-ink text-paper py-16 md:py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl mb-4">Готовы собрать фото с праздника?</h2>
        <p className="text-sm text-paper/75 leading-relaxed mb-8">
          Создайте мероприятие в кабинете или напишите нам — поможем с настройкой и оплатой.
        </p>
        <LandingCtaButtons className="justify-center [&_a:first-child]:bg-paper [&_a:first-child]:text-ink [&_a:last-child]:border-paper [&_a:last-child]:text-paper [&_a:last-child]:hover:bg-paper [&_a:last-child]:hover:text-ink" />
        <p className="mt-8 text-sm">
          <a
            href={LANDING_CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper/90 underline underline-offset-4 hover:text-paper"
          >
            {LANDING_CONTACT.whatsappLabel}
          </a>
        </p>
      </div>
    </section>
  );
}
