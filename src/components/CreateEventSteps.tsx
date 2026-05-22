type Step = 'basic' | 'guest';

const STEPS: { id: Step; label: string }[] = [
  { id: 'basic', label: '1. Основное' },
  { id: 'guest', label: '2. Экран гостя' },
];

type Props = {
  step: Step;
  onChange: (step: Step) => void;
};

export type CreateEventStep = Step;

export default function CreateEventSteps({ step, onChange }: Props) {
  return (
    <nav className="flex border-b border-line -mx-6 px-6 mb-8">
      {STEPS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={`flex-1 py-3 text-xs uppercase tracking-[0.2em] ${
            step === s.id ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
          }`}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}
