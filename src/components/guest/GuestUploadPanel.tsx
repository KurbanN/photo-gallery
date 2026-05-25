import { useCallback, useRef, useState } from 'react';
import { Check, CloudUpload, Heart, Loader2, QrCode } from 'lucide-react';
import { isProbablyMediaFile } from '@/lib/guest-media';

type UploadBanner = { kind: 'loading' | 'success' | 'error'; text: string } | null;

type Props = {
  uploadsOpen: boolean;
  uploadsClosedReason?: string;
  uploading: boolean;
  uploadBanner: UploadBanner;
  uploadError: string;
  author: string;
  onAuthorChange: (v: string) => void;
  onPickFiles: (files: File[]) => void;
};

function HowItWorks() {
  const steps = [
    { n: 1, text: 'Сканируйте QR-код с карточки на столе', Icon: QrCode },
    { n: 2, text: 'Загружайте свои фото и видео', Icon: CloudUpload },
    { n: 3, text: 'Смотрите все воспоминания', Icon: Heart },
  ];
  return (
    <div className="mt-8 border-t border-line pt-6">
      <h3 className="mb-4 text-center font-serif text-lg text-ink">Как это работает?</h3>
      <ol className="space-y-4">
        {steps.map(({ n, text, Icon }) => (
          <li key={n} className="flex items-start gap-3 text-sm text-muted">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-xs font-semibold text-ink">
              {n}
            </span>
            <span className="flex items-center gap-2 pt-1">
              <Icon className="h-4 w-4 shrink-0 text-ink" strokeWidth={1.5} />
              {text}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function GuestUploadPanel({
  uploadsOpen,
  uploadsClosedReason,
  uploading,
  uploadBanner,
  uploadError,
  author,
  onAuthorChange,
  onPickFiles,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const openPicker = () => {
    if (!uploadsOpen) return;
    inputRef.current?.click();
  };

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      const files = Array.from(list).filter(isProbablyMediaFile);
      if (files.length) onPickFiles(files);
    },
    [onPickFiles],
  );

  return (
    <div className="mx-auto max-w-lg px-4 pb-8">
      {!uploadsOpen && (
        <p className="mb-4 border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {uploadsClosedReason || 'Приём файлов закрыт. Галерею можно смотреть.'}
        </p>
      )}

      <div
        className={`rounded-sm border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver ? 'border-ink bg-ink/5' : 'border-line bg-paper'
        } ${!uploadsOpen ? 'opacity-60' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (uploadsOpen) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (uploadsOpen) onFiles(e.dataTransfer.files);
        }}
      >
        <CloudUpload className="mx-auto mb-4 h-10 w-10 text-muted" strokeWidth={1.25} />
        <p className="mb-6 text-sm leading-relaxed text-muted">
          Загрузите свои фото и видео с мероприятия
        </p>
        <button
          type="button"
          disabled={uploading || !uploadsOpen}
          onClick={openPicker}
          className="w-full max-w-xs rounded-full bg-ink py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-paper disabled:opacity-50"
        >
          {uploading ? 'Загрузка…' : 'Выбрать фото и видео'}
        </button>
        <p className="mt-4 text-xs text-muted">или перетащите файлы сюда</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <input
        value={author}
        onChange={(e) => onAuthorChange(e.target.value)}
        placeholder="Подпись (необязательно)"
        className="mt-4 w-full border border-line px-3 py-2 text-sm"
        maxLength={80}
      />

      {uploadBanner && (
        <p
          className={`mt-3 flex items-center justify-center gap-2 px-3 py-3 text-center text-sm ${
            uploadBanner.kind === 'loading'
              ? 'border border-line text-muted'
              : uploadBanner.kind === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {uploadBanner.kind === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploadBanner.kind === 'success' && <Check className="h-4 w-4" />}
          {uploadBanner.text}
        </p>
      )}
      {uploadError && !uploadBanner && <p className="mt-3 text-sm text-red-700">{uploadError}</p>}

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted">
        <Heart className="h-4 w-4 text-ink" strokeWidth={1.5} />
        Спасибо, что делитесь своими лучшими моментами!
      </p>

      <HowItWorks />
    </div>
  );
}
