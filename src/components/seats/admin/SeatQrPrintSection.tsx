import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Printer } from 'lucide-react';
import { BtnSecondary } from '@/components/organizer/organizer-ui';
import { downloadQrPrintCard, printQrPrintCard } from '@/lib/download-qr-card';
import { downloadSeatsQr } from '@/lib/organizer-api';
import { qrDataUrl } from '@/lib/qr-data-url';
import { findSeatUrl } from '@/lib/app-url';

type Props = {
  eventId: string;
  slug: string;
  welcomeTitle: string;
};

export default function SeatQrPrintSection({ eventId, slug, welcomeTitle }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState<'png' | 'print' | 'raw' | null>(null);
  const seatUrl = findSeatUrl(slug);

  useEffect(() => {
    let cancelled = false;
    void qrDataUrl(seatUrl, 480).then((url) => {
      if (!cancelled) setQrSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [seatUrl]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Разместите этот QR у входа. Гости откроют поиск места без PIN.
      </p>
      <p className="break-all text-xs text-muted">{seatUrl.replace(/^https?:\/\//, '')}</p>

      <div className="flex justify-center">
        <div
          ref={printRef}
          data-export-bg="#faf9f7"
          data-print-format="card"
          className="flex w-[320px] flex-col items-center border border-line bg-paper px-8 py-10 text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted">
            {welcomeTitle}
          </p>
          <h2 className="mt-4 font-serif text-3xl text-ink">Найдите своё место</h2>
          <p className="mt-2 text-xs text-muted">Find your seat</p>
          <div className="mt-8 border border-line bg-white p-4">
            {qrSrc ? (
              <img src={qrSrc} alt="" className="h-44 w-44" />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center bg-line/30">
                <Loader2 className="h-6 w-6 animate-spin text-muted" />
              </div>
            )}
          </div>
          <div className="mt-6 h-px w-16 bg-champagne" />
          <p className="mt-6 text-[11px] leading-relaxed text-muted">
            Сканируйте QR и введите имя или фамилию
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <BtnSecondary
          disabled={busy !== null}
          onClick={async () => {
            const el = printRef.current;
            if (!el) return;
            setBusy('png');
            try {
              await downloadQrPrintCard(el, `find-seat-${slug}`, { format: 'card' });
            } catch {
              alert('Не удалось сохранить');
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === 'png' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          PNG карточка
        </BtnSecondary>
        <BtnSecondary
          disabled={busy !== null}
          onClick={() => {
            const el = printRef.current;
            if (!el) return;
            setBusy('print');
            printQrPrintCard(el, { format: 'card' });
            setTimeout(() => setBusy(null), 600);
          }}
        >
          {busy === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
          Печать / PDF
        </BtnSecondary>
        <BtnSecondary
          disabled={busy !== null}
          onClick={() => {
            setBusy('raw');
            void downloadSeatsQr(eventId, slug).finally(() => setBusy(null));
          }}
        >
          {busy === 'raw' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          QR без оформления
        </BtnSecondary>
      </div>
    </div>
  );
}
