import { useRef, useState } from 'react';
import { Download, Loader2, Printer } from 'lucide-react';
import QrPrintCard, { QR_CARD_HEIGHT_PX, QR_CARD_WIDTH_PX } from '@/components/QrPrintCard';
import { downloadQrPrintCard, printQrPrintCard } from '@/lib/download-qr-card';
import { downloadQr } from '@/lib/organizer-api';

type Props = {
  eventId: string;
  slug: string;
  guestUrl: string;
  eventTitle: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  guestPin: string;
  pinEnabled: boolean;
  bgUrl?: string | null;
};

const PREVIEW_MAX_WIDTH = 320;

export default function QrPrintCardSection({
  eventId,
  slug,
  guestUrl,
  eventTitle,
  welcomeTitle,
  welcomeSubtitle,
  guestPin,
  pinEnabled,
  bgUrl = null,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<'png' | 'print' | null>(null);

  const scale = PREVIEW_MAX_WIDTH / QR_CARD_WIDTH_PX;
  const previewHeight = Math.round(QR_CARD_HEIGHT_PX * scale);

  const onDownloadCard = async () => {
    const el = cardRef.current;
    if (!el) return;
    setBusy('png');
    try {
      await downloadQrPrintCard(el, `qr-card-${slug}`);
    } catch {
      alert('Не удалось сохранить карточку');
    } finally {
      setBusy(null);
    }
  };

  const onPrint = () => {
    const el = cardRef.current;
    if (!el) return;
    setBusy('print');
    try {
      printQrPrintCard(el);
    } finally {
      setTimeout(() => setBusy(null), 600);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        Макет A6 для столов: QR и {pinEnabled && guestPin ? 'код гостей' : 'инструкция'}.
      </p>

      <div
        className="mx-auto overflow-hidden rounded-sm border border-line bg-line/30 shadow-inner"
        style={{ width: PREVIEW_MAX_WIDTH, height: previewHeight }}
      >
        <div
          style={{
            width: QR_CARD_WIDTH_PX,
            height: QR_CARD_HEIGHT_PX,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <QrPrintCard
            ref={cardRef}
            guestUrl={guestUrl}
            eventTitle={eventTitle}
            welcomeTitle={welcomeTitle}
            welcomeSubtitle={welcomeSubtitle}
            pin={guestPin}
            pinEnabled={pinEnabled}
            bgUrl={bgUrl}
          />
        </div>
      </div>

      {!guestUrl && (
        <p className="text-sm text-amber-800">Ссылка для гостей ещё не загружена.</p>
      )}
      {pinEnabled && !guestPin && (
        <p className="text-sm text-amber-800">
          Задайте код для гостей выше — он появится на карточке.
        </p>
      )}

      <div className="flex flex-col flex-wrap gap-2 sm:flex-row">
        <button
          type="button"
          disabled={!guestUrl || busy !== null}
          onClick={() => void onDownloadCard()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-paper disabled:opacity-50"
        >
          {busy === 'png' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          PNG карточка
        </button>
        <button
          type="button"
          disabled={!guestUrl || busy !== null}
          onClick={onPrint}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink disabled:opacity-50"
        >
          {busy === 'print' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          Печать
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void downloadQr(eventId, slug)}
          className="inline-flex items-center justify-center gap-2 border border-line px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Только QR
        </button>
      </div>
    </div>
  );
}
