import { useRef, useState } from 'react';
import { Download, Loader2, Printer } from 'lucide-react';
import QrPrintCard from '@/components/QrPrintCard';
import { downloadQrPrintCard, printQrPrintCard } from '@/lib/download-qr-card';
import { downloadQr } from '@/lib/organizer-api';
import {
  normalizeQrPrintFormat,
  QR_PRINT_FORMAT_OPTIONS,
  QR_PRINT_FORMAT_SPECS,
  type QrPrintFormat,
} from '@/lib/qr-print-formats';
import { QR_CARD_VARIANTS, normalizeQrCardVariant, type QrCardVariant } from '@/lib/qr-card-variants';

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
  variant: QrCardVariant;
  onVariantChange: (variant: QrCardVariant) => void | Promise<void>;
  variantSaving?: boolean;
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
  variant,
  onVariantChange,
  variantSaving = false,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [printFormat, setPrintFormat] = useState<QrPrintFormat>('card');
  const [busy, setBusy] = useState<'png' | 'print' | null>(null);
  const activeVariant = normalizeQrCardVariant(variant);
  const format = normalizeQrPrintFormat(printFormat);
  const formatSpec = QR_PRINT_FORMAT_SPECS[format];

  const scale = PREVIEW_MAX_WIDTH / formatSpec.widthPx;
  const previewHeight = Math.round(formatSpec.heightPx * scale);

  const onDownload = async () => {
    const el = printRef.current;
    if (!el) return;
    setBusy('png');
    try {
      const name = `${formatSpec.filenamePrefix}-${slug}-${activeVariant}`;
      await downloadQrPrintCard(el, name, { format });
    } catch {
      alert('Не удалось сохранить макет');
    } finally {
      setBusy(null);
    }
  };

  const onPrint = () => {
    const el = printRef.current;
    if (!el) return;
    setBusy('print');
    try {
      printQrPrintCard(el, { format });
    } finally {
      setTimeout(() => setBusy(null), 600);
    }
  };

  const isCard = format === 'card';
  const downloadLabel = isCard ? 'PNG карточка' : 'PNG баннер';

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        Выберите формат и дизайн, затем скачайте PNG или отправьте на печать. Для типографии укажите размер{' '}
        <span className="font-medium text-ink">{formatSpec.physicalLabel}</span>.
      </p>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Формат печати</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {QR_PRINT_FORMAT_OPTIONS.map((item) => {
            const selected = item.id === format;
            return (
              <button
                key={item.id}
                type="button"
                disabled={variantSaving || busy !== null}
                onClick={() => setPrintFormat(item.id)}
                className={`rounded-sm border px-3 py-3 text-left transition-colors disabled:opacity-50 ${
                  selected ? 'border-ink bg-ink/5 ring-1 ring-ink/20' : 'border-line hover:border-ink/30'
                }`}
              >
                <span className="block text-[11px] font-semibold text-ink">{item.label}</span>
                <span className="mt-0.5 block text-[10px] leading-snug text-muted">{item.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Дизайн</p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {QR_CARD_VARIANTS.map((item) => {
            const selected = item.id === activeVariant;
            return (
              <button
                key={item.id}
                type="button"
                disabled={variantSaving || busy !== null}
                onClick={() => void onVariantChange(item.id)}
                className={`rounded-sm border px-3 py-3 text-left transition-colors disabled:opacity-50 ${
                  selected ? 'border-ink bg-ink/5 ring-1 ring-ink/20' : 'border-line hover:border-ink/30'
                }`}
              >
                <div
                  className="mb-2 flex h-10 items-end justify-between rounded-sm border border-black/5 px-2 pb-1.5"
                  style={{ backgroundColor: item.previewBg }}
                  aria-hidden
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.previewAccent }} />
                  <span className="h-4 w-4 border border-black/15 bg-white" />
                </div>
                <span className="block text-[11px] font-semibold text-ink">{item.label}</span>
                <span className="mt-0.5 block text-[10px] leading-snug text-muted">{item.description}</span>
              </button>
            );
          })}
        </div>

        {variantSaving && (
          <p className="flex items-center gap-2 text-xs text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Сохраняем выбор…
          </p>
        )}
      </div>

      <div
        className="mx-auto overflow-hidden rounded-sm border border-line bg-line/30 shadow-inner"
        style={{ width: PREVIEW_MAX_WIDTH, height: previewHeight }}
      >
        <div
          style={{
            width: formatSpec.widthPx,
            height: formatSpec.heightPx,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <QrPrintCard
            key={format}
            ref={printRef}
            format={format}
            guestUrl={guestUrl}
            eventTitle={eventTitle}
            welcomeTitle={welcomeTitle}
            welcomeSubtitle={welcomeSubtitle}
            pin={guestPin}
            pinEnabled={pinEnabled}
            bgUrl={activeVariant === 'classic' ? bgUrl : null}
            variant={activeVariant}
          />
        </div>
      </div>

      {!guestUrl && (
        <p className="text-sm text-amber-800">Ссылка для гостей ещё не загружена.</p>
      )}
      {pinEnabled && !guestPin && (
        <p className="text-sm text-amber-800">
          Задайте код для гостей выше — он появится на макете.
        </p>
      )}

      <div className="flex flex-col flex-wrap gap-2 sm:flex-row">
        <button
          type="button"
          disabled={!guestUrl || busy !== null || variantSaving}
          onClick={() => void onDownload()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-paper disabled:opacity-50"
        >
          {busy === 'png' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloadLabel}
        </button>
        <button
          type="button"
          disabled={!guestUrl || busy !== null || variantSaving}
          onClick={onPrint}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink disabled:opacity-50"
        >
          {busy === 'print' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          Печать
        </button>
        <button
          type="button"
          disabled={busy !== null || variantSaving}
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
