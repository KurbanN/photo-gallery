import { useRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function PinInput4({ value, onChange, disabled }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(4, ' ').slice(0, 4).split('');

  const setDigit = (index: number, char: string) => {
    const only = char.replace(/\D/g, '').slice(-1);
    const arr = value.padEnd(4, ' ').slice(0, 4).split('');
    arr[index] = only || '';
    const next = arr.join('').replace(/\s/g, '').slice(0, 4);
    onChange(next);
    if (only && index < 3) refs.current[index + 1]?.focus();
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 3)]?.focus();
  };

  return (
    <div className="flex justify-center gap-3" onPaste={onPaste}>
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digits[i]?.trim() ? digits[i] : ''}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="h-14 w-12 sm:h-16 sm:w-14 border border-white/35 bg-black/25 text-center text-2xl font-medium text-white shadow-sm outline-none backdrop-blur-sm focus:border-white/80 focus:bg-black/40"
          aria-label={`Цифра ${i + 1}`}
        />
      ))}
    </div>
  );
}
