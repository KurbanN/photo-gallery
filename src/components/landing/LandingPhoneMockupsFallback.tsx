import { Heart } from 'lucide-react';
import GuestLoginPreview from '@/components/GuestLoginPreview';
import PhoneMockup from '@/components/PhoneMockup';
import { DEFAULT_GUEST_SUBTITLE } from '@/lib/event-branding';
import { getDemoPhotoUrls } from '@/lib/demo-static-photos';

const urls = getDemoPhotoUrls(4);
const loginBg = getDemoPhotoUrls(1)[0] ?? null;

function GalleryScreenMock() {
  return (
    <div className="flex h-full flex-col bg-paper text-left">
      <header className="border-b border-line px-2.5 pb-2 pt-7">
        <p className="truncate font-serif text-[11px] leading-tight text-ink">День рождения</p>
        <p className="mt-0.5 text-[7px] text-muted">15 мая 2026</p>
      </header>
      <div className="flex gap-0.5 border-b border-line px-2 py-1.5">
        <span className="bg-ink px-2 py-0.5 text-[6px] uppercase tracking-[0.12em] text-paper">Лента</span>
        <span className="px-2 py-0.5 text-[6px] uppercase tracking-[0.12em] text-muted">Загрузить</span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-2 py-2">
        <p className="mb-1.5 text-[6px] text-muted">24 в ленте</p>
        <ul className="grid grid-cols-2 gap-1">
          {urls.map((url) => (
            <li key={url} className="relative aspect-square overflow-hidden border border-line bg-line/40">
              <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              <span className="absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full bg-black/45">
                <Heart className="block size-2 text-white/90" strokeWidth={1.5} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <nav className="flex justify-around border-t border-line px-1 py-2">
        <span className="text-[6px] uppercase tracking-[0.1em] text-ink">Фото</span>
        <span className="text-[6px] uppercase tracking-[0.1em] text-muted">Видео</span>
        <span className="text-[6px] uppercase tracking-[0.1em] text-muted">Избранное</span>
      </nav>
    </div>
  );
}

/** CSS-мокапы телефонов, пока нет PNG в public/landing/mockups/. */
export function LandingHeroPhoneMockups({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-10 py-4 sm:flex-row sm:gap-0 ${className}`}
      aria-hidden={false}
    >
      <PhoneMockup label="Вход по PIN" className="z-10 sm:-rotate-6 sm:translate-x-1">
        <GuestLoginPreview
          bgUrl={loginBg}
          welcomeTitle="День рождения"
          welcomeSubtitle={DEFAULT_GUEST_SUBTITLE}
          pinPreview="4821"
          className="!max-h-none h-full w-full border-0"
        />
      </PhoneMockup>
      <PhoneMockup label="Живая лента" className="z-20 sm:-ml-12 sm:rotate-6 sm:-translate-y-3">
        <GalleryScreenMock />
      </PhoneMockup>
    </div>
  );
}

export function LandingShowcasePhoneMock({ variant }: { variant: 'login' | 'gallery' }) {
  if (variant === 'login') {
    return (
      <PhoneMockup className="mx-auto scale-90 sm:scale-100">
        <GuestLoginPreview
          bgUrl={loginBg}
          welcomeTitle="День рождения"
          welcomeSubtitle={DEFAULT_GUEST_SUBTITLE}
          pinPreview="4821"
          className="!max-h-none h-full w-full border-0"
        />
      </PhoneMockup>
    );
  }
  return (
    <PhoneMockup className="mx-auto scale-90 sm:scale-100">
      <GalleryScreenMock />
    </PhoneMockup>
  );
}
