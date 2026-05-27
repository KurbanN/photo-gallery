import type { LucideIcon } from 'lucide-react';
import { Heart, Images, Lock, QrCode, Smartphone, Zap } from 'lucide-react';
import { LANDING_FEATURES } from '@/content/landing';
import LandingSection from '@/components/landing/LandingSection';

const FEATURE_ICONS: Record<(typeof LANDING_FEATURES)[number]['title'], LucideIcon> = {
  'Без приложения': Smartphone,
  'PIN-доступ': Lock,
  'QR для столов': QrCode,
  'Лента в реальном времени': Zap,
  'Избранное и скачивание': Heart,
  'До 300 фотографий': Images,
};

export default function LandingFeatures() {
  return (
    <LandingSection
      id="features"
      title="Возможности"
      subtitle="Всё необходимое для сбора фото с мероприятия — без лишней сложности."
    >
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-3">
        {LANDING_FEATURES.map((f) => {
          const Icon = FEATURE_ICONS[f.title];
          return (
            <li key={f.title} className="min-w-0">
              <h3 className="mb-1 flex items-start gap-2 font-medium text-sm text-ink sm:text-base">
                <Icon className="mt-0.5 size-4 shrink-0 text-ink sm:size-5" strokeWidth={1.5} aria-hidden />
                <span>{f.title}</span>
              </h3>
              <p className="text-xs leading-relaxed text-muted line-clamp-3 sm:text-sm sm:line-clamp-none">
                {f.text}
              </p>
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
}
