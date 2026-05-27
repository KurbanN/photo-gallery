import { forwardRef } from 'react';
import { normalizeQrCardVariant, type QrCardVariant } from '@/lib/qr-card-variants';
import QrPrintCardBotanical from './qr-cards/QrPrintCardBotanical';
import QrPrintCardClassic from './qr-cards/QrPrintCardClassic';
import QrPrintCardMinimal from './qr-cards/QrPrintCardMinimal';
import QrPrintCardNoir from './qr-cards/QrPrintCardNoir';
import type { QrPrintCardProps } from './qr-cards/types';
import { useQrCardContent } from './qr-cards/use-qr-card-content';

export { QR_CARD_HEIGHT_PX, QR_CARD_WIDTH_PX } from './qr-cards/QrCardShared';
export type { QrPrintCardProps } from './qr-cards/types';
export type { QrCardVariant } from '@/lib/qr-card-variants';

const QrPrintCard = forwardRef<HTMLDivElement, QrPrintCardProps>(function QrPrintCard(props, ref) {
  const variant = normalizeQrCardVariant(props.variant);
  const content = useQrCardContent(props);
  const layoutProps = { ...props, ...content };

  switch (variant) {
    case 'minimal':
      return <QrPrintCardMinimal ref={ref} {...layoutProps} />;
    case 'botanical':
      return <QrPrintCardBotanical ref={ref} {...layoutProps} />;
    case 'noir':
      return <QrPrintCardNoir ref={ref} {...layoutProps} />;
    case 'classic':
    default:
      return <QrPrintCardClassic ref={ref} {...layoutProps} />;
  }
});

export default QrPrintCard;
