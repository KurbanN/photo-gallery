import { Download, Loader2, X } from 'lucide-react';
import type { PhotoEntry } from '@/lib/guest-api';
import { mediaTypeOf } from '@/lib/guest-media';

type Props = {
  item: PhotoEntry;
  downloadBusy: boolean;
  onClose: () => void;
  onDownload: () => void;
};

export default function GuestMediaLightbox({ item, downloadBusy, onClose, onDownload }: Props) {
  const isVideo = mediaTypeOf(item) === 'video';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/94 p-4"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <button
        type="button"
        className="self-end text-paper"
        onClick={onClose}
        aria-label="Закрыть"
      >
        <X className="h-7 w-7" />
      </button>
      <div className="flex flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video
            src={item.url}
            controls
            playsInline
            className="max-h-[75dvh] max-w-full"
          />
        ) : (
          <img src={item.url} alt="" className="max-h-[75dvh] max-w-full object-contain" />
        )}
      </div>
      <div className="mt-4 text-center text-paper/80">
        {item.author && <p className="text-sm">{item.author}</p>}
        <button
          type="button"
          disabled={downloadBusy}
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em]"
        >
          {downloadBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Скачать
        </button>
      </div>
    </div>
  );
}
