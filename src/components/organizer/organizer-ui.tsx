import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function OrganizerPageShell({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh flex flex-col bg-paper pb-12">{children}</div>;
}

export function OrganizerHeader({
  backTo,
  backLabel,
  title,
  meta,
}: {
  backTo: string;
  backLabel: string;
  title: string;
  meta?: ReactNode;
}) {
  return (
    <header className="shrink-0 border-b border-line bg-paper/95 px-4 py-4 backdrop-blur-sm sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to={backTo} className="text-[10px] uppercase tracking-[0.2em] text-muted hover:text-ink">
          ← {backLabel}
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-ink md:text-3xl">{title}</h1>
        {meta && <div className="mt-2 text-xs text-muted">{meta}</div>}
      </div>
    </header>
  );
}

export function OrganizerSection({
  title,
  description,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-line bg-paper p-4 sm:p-5 ${className}`}>
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">{title}</h2>
      {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
      <div className={description ? 'mt-4 space-y-4' : 'mt-4 space-y-4'}>{children}</div>
    </section>
  );
}

export function OrganizerField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] text-muted/90">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  'w-full border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink';

export const textareaClass =
  'w-full resize-y border border-line bg-white px-3 py-2.5 text-sm leading-relaxed text-ink outline-none focus:border-ink';

export function BtnPrimary({
  children,
  disabled,
  onClick,
  type = 'button',
  className = '',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-paper disabled:opacity-50 sm:w-auto ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({
  children,
  disabled,
  onClick,
  className = '',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 border border-ink bg-paper px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function StatusMessage({ text, error }: { text: string; error?: boolean }) {
  const isErr = error ?? /ошиб|не удал/i.test(text);
  return (
    <p
      className={`text-sm ${isErr ? 'text-red-700' : 'border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900'}`}
    >
      {text}
    </p>
  );
}
