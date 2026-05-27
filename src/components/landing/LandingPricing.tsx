import { LANDING_PRICING, formatLandingPrice } from '@/content/landing';
import LandingSection from '@/components/landing/LandingSection';
import LandingPrice from '@/components/landing/LandingPrice';
import { LandingCtaButtons } from '@/components/landing/LandingButtons';

export default function LandingPricing() {
  const { photoLimit, currency, price } = LANDING_PRICING;

  return (
    <LandingSection
      id="pricing"
      title="Один пакет — всё включено"
      subtitle="Без выбора тарифов. Создайте мероприятие и начните принимать фото."
      className="border-y border-line"
    >
      <div className="mx-auto max-w-md border border-line bg-paper p-8 md:p-10 text-center">
        <LandingPrice size="lg" className="mb-4 justify-center" />
        <p className="text-sm text-muted mb-6">за одно мероприятие</p>
        <ul className="text-sm text-muted text-left space-y-2 mb-8 border-t border-line pt-6">
          <li>До {photoLimit} фотографий от гостей</li>
          <li>Закрытый альбом по PIN</li>
          <li>QR-карточки для печати</li>
          <li>Кабинет организатора и демо-лента</li>
          <li>Доступ к галерее после праздника</li>
        </ul>
        <p className="text-xs text-muted mb-6">
          Оплата и подключение — через{' '}
          <a href="https://wa.clck.bar/77471110010" className="text-ink underline" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </p>
        <LandingCtaButtons stack className="mx-auto" />
        <p className="mt-4 text-[10px] text-muted">
          от {formatLandingPrice(price)} {currency} · фиксированный лимит {photoLimit} фото
        </p>
      </div>
    </LandingSection>
  );
}
