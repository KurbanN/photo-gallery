import { useCallback, useRef, useState } from 'react';
import {
  Camera,
  Check,
  CloudUpload,
  Heart,
  Loader2,
  QrCode,
  Send,
  SwitchCamera,
} from 'lucide-react';
import { isProbablyMediaFile } from '@/lib/guest-media';

type UploadBanner = { kind: 'loading' | 'success' | 'error'; text: string } | null;

type CameraBlockProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  bgUrl: string | null;
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOpening: boolean;
  pendingPreviewUrl: string | null;
  cameraFacing: 'environment' | 'user';
  uploading: boolean;
  uploadsOpen: boolean;
  uploadBanner: UploadBanner;
  shootError: string;
  author: string;
  onAuthorChange: (v: string) => void;
  onOpenCamera: () => void;
  onFlipCamera: () => void;
  onTakePhoto: () => void;
  onDiscardPending: () => void;
  onConfirmUpload: () => void;
  onVideoTapFocus: (e: React.PointerEvent<HTMLVideoElement>) => void;
};

type Props = {
  uploadsOpen: boolean;
  uploadsClosedReason?: string;
  uploading: boolean;
  uploadBanner: UploadBanner;
  shootError: string;
  author: string;
  onAuthorChange: (v: string) => void;
  onPickFiles: (files: File[]) => void;
  camera: CameraBlockProps;
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

function CameraSection(props: CameraBlockProps) {
  const {
    videoRef,
    bgUrl,
    cameraReady,
    cameraBlocked,
    cameraOpening,
    pendingPreviewUrl,
    cameraFacing,
    uploading,
    uploadsOpen,
    uploadBanner,
    shootError,
    author,
    onAuthorChange,
    onOpenCamera,
    onFlipCamera,
    onTakePhoto,
    onDiscardPending,
    onConfirmUpload,
    onVideoTapFocus,
  } = props;

  return (
    <div className="mt-6 space-y-3">
      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted">Или снимите с камеры</p>
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-black">
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover ${
            cameraReady && !pendingPreviewUrl ? 'opacity-100' : 'opacity-0'
          } ${cameraFacing === 'user' ? '[transform:scaleX(-1)]' : ''}`}
          playsInline
          muted
          onPointerDown={cameraReady && !pendingPreviewUrl ? onVideoTapFocus : undefined}
        />
        {!cameraReady && !pendingPreviewUrl && (
          <div className="absolute inset-0 flex flex-col">
            {bgUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-ink/80" />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 p-6">
              {cameraOpening ? (
                <Loader2 className="h-10 w-10 animate-spin text-paper" />
              ) : (
                <button
                  type="button"
                  onClick={onOpenCamera}
                  className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-xs uppercase text-paper"
                >
                  <Camera className="h-4 w-4" />
                  {cameraBlocked ? 'Попробовать снова' : 'Открыть камеру'}
                </button>
              )}
            </div>
          </div>
        )}
        {pendingPreviewUrl && (
          <div className="absolute inset-0 z-40 grid grid-rows-[1fr_auto] bg-black">
            <img src={pendingPreviewUrl} alt="" className="min-h-0 h-full w-full object-contain" />
            <div className="flex shrink-0 gap-3 border-t border-white/20 bg-black p-4">
              <button
                type="button"
                onClick={onDiscardPending}
                disabled={uploading}
                className="flex-1 border border-paper/50 py-3 text-xs uppercase text-paper disabled:opacity-50"
              >
                Переснять
              </button>
              <button
                type="button"
                onClick={onConfirmUpload}
                disabled={uploading || !uploadsOpen}
                className="flex flex-1 items-center justify-center gap-2 bg-paper py-3 text-xs font-semibold uppercase text-ink disabled:opacity-60"
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Отправить
              </button>
            </div>
          </div>
        )}
        {cameraReady && !pendingPreviewUrl && (
          <>
            <button
              type="button"
              onClick={onFlipCamera}
              className="absolute bottom-4 left-4 z-20 rounded-full bg-black/45 p-3 text-paper"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onTakePhoto}
              className="absolute bottom-4 left-1/2 z-20 h-16 w-16 -translate-x-1/2 rounded-full border-4 border-paper"
              aria-label="Сфотографировать"
            />
          </>
        )}
      </div>
      <input
        value={author}
        onChange={(e) => onAuthorChange(e.target.value)}
        placeholder="Подпись (необязательно)"
        className="w-full border border-line px-3 py-2 text-sm"
        maxLength={80}
      />
      {uploadBanner && (
        <p
          className={`flex items-center justify-center gap-2 px-3 py-3 text-center text-sm ${
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
      {shootError && !uploadBanner && <p className="text-sm text-red-700">{shootError}</p>}
    </div>
  );
}

export default function GuestUploadPanel({
  uploadsOpen,
  uploadsClosedReason,
  uploading,
  onPickFiles,
  camera,
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

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted">
        <Heart className="h-4 w-4 text-ink" strokeWidth={1.5} />
        Спасибо, что делитесь своими лучшими моментами!
      </p>

      <CameraSection {...camera} />
      <HowItWorks />
    </div>
  );
}
