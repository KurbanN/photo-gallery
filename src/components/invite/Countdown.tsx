import { useEffect, useState } from 'react';

function diffParts(targetIso: string) {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, done: diff <= 0 };
}

export default function Countdown({ targetIso }: { targetIso: string | null }) {
  const [parts, setParts] = useState(() => (targetIso ? diffParts(targetIso) : null));

  useEffect(() => {
    if (!targetIso) return;
    setParts(diffParts(targetIso));
    const timer = setInterval(() => setParts(diffParts(targetIso)), 1000 * 30);
    return () => clearInterval(timer);
  }, [targetIso]);

  if (!targetIso || !parts) return null;
  if (parts.done) {
    return <p className="text-sm opacity-80">Мероприятие уже началось</p>;
  }
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
      <div className="rounded-lg border border-line/60 p-2">
        <p className="text-xl font-semibold">{parts.days}</p>
        <p className="text-[10px] uppercase tracking-[0.14em] opacity-70">дней</p>
      </div>
      <div className="rounded-lg border border-line/60 p-2">
        <p className="text-xl font-semibold">{parts.hours}</p>
        <p className="text-[10px] uppercase tracking-[0.14em] opacity-70">часов</p>
      </div>
      <div className="rounded-lg border border-line/60 p-2">
        <p className="text-xl font-semibold">{parts.minutes}</p>
        <p className="text-[10px] uppercase tracking-[0.14em] opacity-70">минут</p>
      </div>
    </div>
  );
}
