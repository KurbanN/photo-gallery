type Aspect = 'phone' | 'wide';

type Props = {
  src?: string;
  alt: string;
  aspect?: Aspect;
  label?: string;
  className?: string;
};

const aspectClass: Record<Aspect, string> = {
  phone: 'aspect-[9/19] w-full max-w-[220px] mx-auto',
  wide: 'aspect-video w-full max-w-2xl mx-auto',
};

const placeholderFrameClass =
  'rounded-2xl border border-line bg-line/25 shadow-[0_12px_40px_-16px_rgba(10,10,10,0.15)]';

export default function MockupSlot({ src, alt, aspect = 'phone', label, className = '' }: Props) {
  return (
    <figure className={`w-full ${className}`}>
      <div
        className={`${aspectClass[aspect]} flex items-center justify-center overflow-hidden ${src ? '' : placeholderFrameClass}`}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-contain" loading="lazy" decoding="async" />
        ) : (
          <span className="px-6 text-center text-[10px] uppercase tracking-[0.18em] text-muted">
            Мокап: {alt}
          </span>
        )}
      </div>
      {label ? <figcaption className="mt-3 text-center text-xs text-muted">{label}</figcaption> : null}
    </figure>
  );
}
