import { useEffect, useRef } from 'react';
import { invitariumBuildBase, invitariumLuxonUrl } from './paths';

declare global {
  interface Window {
    luxon?: { DateTime: { fromISO: (s: string, o?: { zone: string }) => { toJSDate: () => Date } } };
    Timer?: new (
      el: HTMLElement,
      endDate?: Date | null,
      units?: string[],
    ) => { setUnits: (u: string[]) => void; setEndDate: (d: Date) => void };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

const LABELS: Record<string, string> = {
  days: 'дней',
  hours: 'часов',
  minutes: 'минут',
  seconds: 'секунд',
};

export default function InvitariumCountdown({ targetIso }: { targetIso: string | null }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!targetIso || !rootRef.current) return;

    const build = invitariumBuildBase();
    let cancelled = false;

    void (async () => {
      try {
        await loadScript(invitariumLuxonUrl());
        await loadScript(`${build}/js/timerInline.js`);
        if (cancelled || !rootRef.current || !window.luxon || !window.Timer) return;

        const el = rootRef.current;
        const dt = window.luxon.DateTime.fromISO(targetIso, { zone: 'UTC' }).toJSDate();
        const timer = new window.Timer(el, null, []);
        timer.setUnits(['days', 'hours', 'minutes', 'seconds']);
        timer.setEndDate(dt);

        el.querySelectorAll('.countdown-label').forEach((node) => {
          const unit = (node.parentElement as HTMLElement | null)?.dataset?.unit;
          if (unit && LABELS[unit]) node.textContent = LABELS[unit];
        });
      } catch {
        /* таймер опционален */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targetIso]);

  if (!targetIso) return null;

  return (
    <div
      ref={rootRef}
      className="countdown"
      id="invitarium-countdown"
      aria-live="polite"
    >
      <div className="countdown-unit" data-unit="days">
        <div className="countdown-value">00</div>
        <div className="countdown-label">дней</div>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-unit" data-unit="hours">
        <div className="countdown-value">00</div>
        <div className="countdown-label">часов</div>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-unit" data-unit="minutes">
        <div className="countdown-value">00</div>
        <div className="countdown-label">минут</div>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-unit countdown-unit--last" data-unit="seconds">
        <div className="countdown-value">00</div>
        <div className="countdown-label">секунд</div>
      </div>
    </div>
  );
}
