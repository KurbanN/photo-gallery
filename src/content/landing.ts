/** Тексты и пути к мокапам лендинга. Пустой src — показывается CSS-заглушка. */
const MOCKUP_BASE = '/landing/mockups';

export const LANDING_MOCKUPS = {
  hero: `${MOCKUP_BASE}/mockup-gallery.png`,
  login: `${MOCKUP_BASE}/mockup-login.png`,
  gallery: `${MOCKUP_BASE}/mockup-gallery.png`,
  upload: `${MOCKUP_BASE}/mockup-upload.png`,
  dashboard: `${MOCKUP_BASE}/mockup-dashboard.png`,
} as const;

export const LANDING_CONTACT = {
  whatsappUrl: 'https://wa.clck.bar/77471110010',
  whatsappLabel: 'WhatsApp +7 747 111 00 10',
} as const;

export const LANDING_PRICING = {
  price: 25_000,
  compareAt: 30_000,
  currency: '₸',
  photoLimit: 300,
} as const;

export const LANDING_NAV = [
  { id: 'how', label: 'Как работает' },
  { id: 'showcase', label: 'Примеры' },
  { id: 'features', label: 'Возможности' },
  { id: 'pricing', label: 'Цена' },
  { id: 'faq', label: 'Вопросы' },
] as const;

export const LANDING_HERO = {
  title: 'Все фото с мероприятия — в одной живой ленте',
  subtitle:
    'QR на столах — гости снимают с телефона без приложения — вы видите кадры в реальном времени и сохраняете их после праздника.',
  useCases: 'Свадьбы · дни рождения · корпоративы',
} as const;

export const LANDING_STEPS = [
  {
    step: '01',
    title: 'Разместите QR',
    text: 'Распечатайте карточки со ссылкой и PIN — гости открывают альбом с телефона.',
  },
  {
    step: '02',
    title: 'Гости загружают',
    text: 'Фото и видео попадают в общую ленту. Можно подписать имя или стол.',
  },
  {
    step: '03',
    title: 'Смотрите вместе',
    text: 'Лента обновляется на глазах. Избранное, скачивание — всё в одном месте.',
  },
] as const;

export const LANDING_SHOWCASE = [
  {
    key: 'login' as const,
    mockupKey: 'login' as const,
    title: 'Вход по PIN',
    description: 'Закрытый альбом — только гости с кодом с карточки.',
  },
  {
    key: 'gallery' as const,
    mockupKey: 'gallery' as const,
    title: 'Живая лента',
    description: 'Сетка фото и видео, избранное, обновление в один клик.',
  },
  {
    key: 'upload' as const,
    mockupKey: 'upload' as const,
    title: 'Загрузка с телефона',
    description: 'Гости выбирают фото и видео в браузере — без установки приложения.',
  },
  {
    key: 'dashboard' as const,
    mockupKey: 'dashboard' as const,
    title: 'Кабинет организатора',
    description: 'PIN для гостей, QR-карточки для столов, управление мероприятием.',
  },
] as const;

export const LANDING_FEATURES = [
  {
    title: 'Без приложения',
    text: 'Гости открывают ссылку в браузере — ничего не устанавливают.',
  },
  {
    title: 'PIN-доступ',
    text: 'Альбом закрыт кодом с QR-карточки — посторонние не попадут.',
  },
  {
    title: 'QR для столов',
    text: 'Готовые макеты карточек под печать — классика, минимализм и другие стили.',
  },
  {
    title: 'Лента в реальном времени',
    text: 'Новые кадры появляются сразу — удобно на экране или проекторе.',
  },
  {
    title: 'Избранное и скачивание',
    text: 'Гости отмечают лучшие кадры и сохраняют себе понравившиеся.',
  },
  {
    title: 'До 300 фотографий',
    text: 'Один пакет на мероприятие — достаточно для камерного праздника.',
  },
] as const;

export const LANDING_FAQ = [
  {
    q: 'Нужно ли гостям устанавливать приложение?',
    a: 'Нет. Достаточно отсканировать QR или открыть ссылку в Safari / Chrome.',
  },
  {
    q: 'Сколько фото можно загрузить?',
    a: 'До 300 фотографий на одно мероприятие в текущем пакете.',
  },
  {
    q: 'Как оплатить?',
    a: 'Напишите нам в WhatsApp — поможем создать мероприятие и оформить доступ.',
  },
  {
    q: 'Фото останутся после праздника?',
    a: 'Да. Организатор видит галерею в кабинете, гости могут вернуться по ссылке и PIN.',
  },
  {
    q: 'Можно посмотреть до покупки?',
    a: 'Да — откройте демо-ленту с примерами кадров и интерфейсом гостя.',
  },
] as const;

export function formatLandingPrice(amount: number): string {
  return amount.toLocaleString('ru-RU');
}
