/** Макет A6 (105 × 148 mm) — пиксели при ~254 DPI макета. */
export const QR_CARD_WIDTH_PX = 1050;
export const QR_CARD_HEIGHT_PX = 1485;

export type QrPrintFormat = 'card' | 'banner-stand' | 'banner-welcome';

export type QrPrintFormatSpec = {
  id: QrPrintFormat;
  label: string;
  description: string;
  widthPx: number;
  heightPx: number;
  /** Размер для типографии */
  physicalLabel: string;
  physicalWidthMm: number;
  physicalHeightMm: number;
  qrGenerateSize: number;
  qrDisplaySize: number;
  pixelRatio: number;
  printPageSize: string;
  printMargin: string;
  filenamePrefix: string;
};

export const QR_PRINT_FORMAT_SPECS: Record<QrPrintFormat, QrPrintFormatSpec> = {
  card: {
    id: 'card',
    label: 'Карточка A6',
    description: 'Для столов, 105 × 148 mm',
    widthPx: QR_CARD_WIDTH_PX,
    heightPx: QR_CARD_HEIGHT_PX,
    physicalLabel: '105 × 148 mm (A6)',
    physicalWidthMm: 105,
    physicalHeightMm: 148,
    qrGenerateSize: 520,
    qrDisplaySize: 400,
    pixelRatio: 3,
    printPageSize: 'A6 portrait',
    printMargin: '8mm',
    filenamePrefix: 'qr-card',
  },
  'banner-stand': {
    id: 'banner-stand',
    label: 'Баннер (стойка)',
    description: 'Roll-up, 100 × 200 cm',
    widthPx: 1500,
    heightPx: 3000,
    physicalLabel: '1000 × 2000 mm',
    physicalWidthMm: 1000,
    physicalHeightMm: 2000,
    qrGenerateSize: 1400,
    qrDisplaySize: 760,
    pixelRatio: 4,
    printPageSize: '1000mm 2000mm',
    printMargin: '0',
    filenamePrefix: 'qr-banner-stand',
  },
  'banner-welcome': {
    id: 'banner-welcome',
    label: 'Баннер',
    description: 'Welcome-борд, 80 × 120 cm',
    widthPx: 1200,
    heightPx: 1800,
    physicalLabel: '800 × 1200 mm',
    physicalWidthMm: 800,
    physicalHeightMm: 1200,
    qrGenerateSize: 1000,
    qrDisplaySize: 560,
    pixelRatio: 4,
    printPageSize: '800mm 1200mm',
    printMargin: '0',
    filenamePrefix: 'qr-banner-welcome',
  },
};

export const QR_PRINT_FORMAT_OPTIONS = [
  QR_PRINT_FORMAT_SPECS.card,
  QR_PRINT_FORMAT_SPECS['banner-stand'],
  QR_PRINT_FORMAT_SPECS['banner-welcome'],
] as const;

export function isQrPrintFormat(value: unknown): value is QrPrintFormat {
  return value === 'card' || value === 'banner-stand' || value === 'banner-welcome';
}

export function normalizeQrPrintFormat(value: unknown): QrPrintFormat {
  return isQrPrintFormat(value) ? value : 'card';
}

export function isBannerFormat(format: QrPrintFormat): boolean {
  return format !== 'card';
}

/** Масштаб по высоте относительно A6. */
export function printScale(format: QrPrintFormat): number {
  return QR_PRINT_FORMAT_SPECS[format].heightPx / QR_CARD_HEIGHT_PX;
}

export function scalePx(px: number, format: QrPrintFormat): number {
  return Math.round(px * printScale(format));
}

/** Масштаб по ширине (отступы, рамки). */
export function scaleWidthPx(px: number, format: QrPrintFormat): number {
  const spec = QR_PRINT_FORMAT_SPECS[format];
  return Math.round(px * (spec.widthPx / QR_CARD_WIDTH_PX));
}
