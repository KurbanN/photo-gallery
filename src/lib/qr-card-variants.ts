export type QrCardVariant = 'classic' | 'minimal' | 'botanical' | 'noir';

export type QrCardVariantMeta = {
  id: QrCardVariant;
  label: string;
  description: string;
  previewBg: string;
  previewAccent: string;
};

export const QR_CARD_VARIANTS: QrCardVariantMeta[] = [
  {
    id: 'classic',
    label: 'Классика',
    description: 'Рамка и углы, светлый фон',
    previewBg: '#faf9f7',
    previewAccent: '#0a0a0a',
  },
  {
    id: 'minimal',
    label: 'Минимал',
    description: 'Чистый белый, много воздуха',
    previewBg: '#ffffff',
    previewAccent: '#0a0a0a',
  },
  {
    id: 'botanical',
    label: 'Ботаника',
    description: 'Шалфей и крем, свадебный стиль',
    previewBg: '#f4f1ea',
    previewAccent: '#6b7f5c',
  },
  {
    id: 'noir',
    label: 'Noir',
    description: 'Тёмный фон, золотые акценты',
    previewBg: '#141414',
    previewAccent: '#c4a962',
  },
];

export function isQrCardVariant(value: unknown): value is QrCardVariant {
  return (
    value === 'classic' ||
    value === 'minimal' ||
    value === 'botanical' ||
    value === 'noir'
  );
}

export function normalizeQrCardVariant(value: unknown): QrCardVariant {
  return isQrCardVariant(value) ? value : 'classic';
}
