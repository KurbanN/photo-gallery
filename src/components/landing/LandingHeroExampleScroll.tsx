import { LANDING_EXAMPLE_PHOTOS } from '@/content/landing';

/** Горизонтальная лента фото под hero. Мобилка — скролл; ПК — на всю ширину, 4 колонки. */
export default function LandingHeroExampleScroll() {
  return (
    <div className="min-w-0 w-full max-lg:overflow-x-auto max-lg:overscroll-x-contain">
      <ul
        className="flex max-lg:w-max items-center gap-3 snap-x snap-mandatory px-6 pb-1 max-lg:pr-6 lg:grid lg:w-full lg:grid-cols-4 lg:gap-5 lg:snap-none lg:px-8 lg:pb-0 xl:gap-6 xl:px-12 2xl:px-16"
        aria-label="Примеры кадров с мероприятий"
      >
        {LANDING_EXAMPLE_PHOTOS.map((src, index) => (
          <li
            key={src}
            className="flex h-[168px] w-[224px] shrink-0 snap-center items-center justify-center sm:max-lg:h-[180px] sm:max-lg:w-[240px] lg:h-auto lg:w-full lg:min-w-0"
          >
            <img
              src={src}
              alt={`Пример фото ${index + 1}`}
              className="max-h-full max-w-full rounded-xl object-contain lg:mx-auto lg:h-auto lg:w-full lg:max-h-[min(42vh,360px)] xl:max-h-[min(44vh,400px)]"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </li>
        ))}
      </ul>
      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.15em] text-muted lg:hidden">
        Свайп →
      </p>
    </div>
  );
}
