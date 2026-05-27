/** Декоративная рамка в духе казахского орнамента (қошқар мүйіз, ромбы, волны). */

export const KAZAKH_THEME = {
  bg: '#faf6ee',
  blue: '#1e4d6b',
  gold: '#b8922e',
  terracotta: '#a65c3a',
  ink: '#1a1a1a',
  muted: '#5c5348',
} as const;

type FrameProps = {
  color?: string;
  accent?: string;
};

/** Горизонтальная полоса: центральный ромб и парные «рога» по бокам */
function KazakhBorderBand({ color, accent, mirror = false }: FrameProps & { mirror?: boolean }) {
  const c = color ?? KAZAKH_THEME.blue;
  const a = accent ?? KAZAKH_THEME.gold;
  return (
    <svg
      viewBox="0 0 994 88"
      fill="none"
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      style={mirror ? { transform: 'scaleY(-1)' } : undefined}
      aria-hidden
    >
      {/* базовая линия */}
      <path d="M24 44h946" stroke={c} strokeWidth="1" strokeOpacity="0.35" />

      {/* центральный қазық / ромб */}
      <path d="M497 12l28 32-28 32-28-32z" stroke={a} strokeWidth="1.5" fill={`${a}18`} />
      <path d="M497 22l16 18-16 18-16-18z" stroke={c} strokeWidth="1" fill="none" />
      <circle cx="497" cy="40" r="4" fill={a} fillOpacity="0.7" />

      {/* левый блок: қошқар мүйіз (спирали-рога) */}
      <g stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M120 44c-18-22-36-28-52-20s-20 32-8 48c12 16 36 20 56 8" strokeOpacity="0.85" />
        <path d="M168 44c-14-18-30-22-44-14s-14 26-6 40c8 14 28 18 44 8" strokeOpacity="0.7" />
        <path d="M88 44c-10-14-22-18-32-10s-10 22-2 34c8 12 24 14 36 6" strokeOpacity="0.55" />
      </g>
      <g stroke={a} strokeWidth="1" fill="none" strokeOpacity="0.65">
        <path d="M200 44c-8-10-18-12-26-6s-6 16 0 24c6 8 18 10 28 4" />
        <path d="M248 44c-6-8-14-10-20-5s-4 12 0 18c4 6 12 8 20 3" />
      </g>

      {/* правый блок — зеркально */}
      <g transform="translate(994 0) scale(-1 1)">
        <g stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round">
          <path d="M120 44c-18-22-36-28-52-20s-20 32-8 48c12 16 36 20 56 8" strokeOpacity="0.85" />
          <path d="M168 44c-14-18-30-22-44-14s-14 26-6 40c8 14 28 18 44 8" strokeOpacity="0.7" />
          <path d="M88 44c-10-14-22-18-32-10s-10 22-2 34c8 12 24 14 36 6" strokeOpacity="0.55" />
        </g>
        <g stroke={a} strokeWidth="1" fill="none" strokeOpacity="0.65">
          <path d="M200 44c-8-10-18-12-26-6s-6 16 0 24c6 8 18 10 28 4" />
          <path d="M248 44c-6-8-14-10-20-5s-4 12 0 18c4 6 12 8 20 3" />
        </g>
      </g>

      {/* повторяющиеся ромбы по краям */}
      {[72, 140, 854, 922].map((x) => (
        <path key={x} d={`M${x} 36l8 8-8 8-8-8z`} stroke={a} strokeWidth="1" fill={`${a}22`} />
      ))}

      {/* волны «толқын» */}
      <path
        d="M320 52c24-6 48-6 72 0s48 6 72 0 48-6 72 0 48 6 72 0"
        stroke={c}
        strokeWidth="0.9"
        strokeOpacity="0.4"
        fill="none"
      />
      <path
        d="M320 36c24 6 48 6 72 0s48-6 72 0 48 6 72 0 48-6 72 0"
        stroke={c}
        strokeWidth="0.9"
        strokeOpacity="0.35"
        fill="none"
      />
    </svg>
  );
}

/** Вертикальная полоса для боков */
function KazakhSideStrip({ color, accent }: FrameProps) {
  const c = color ?? KAZAKH_THEME.blue;
  const a = accent ?? KAZAKH_THEME.gold;
  return (
    <svg viewBox="0 0 56 400" fill="none" className="block h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <path d="M28 8v384" stroke={c} strokeWidth="1" strokeOpacity="0.3" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const y = 28 + i * 46;
        return (
          <g key={i} transform={`translate(28 ${y})`}>
            <path d="M0-10l8 10-8 10-8-10z" stroke={a} strokeWidth="1" fill={`${a}15`} transform="scale(0.85)" />
            <path
              d="M-12 0c-6-8-6-16 0-22s12-4 18 2"
              stroke={c}
              strokeWidth="1"
              fill="none"
              strokeOpacity="0.6"
              transform="scale(0.7) rotate(-90)"
            />
            <path
              d="M12 0c6-8 6-16 0-22s-12-4-18 2"
              stroke={c}
              strokeWidth="1"
              fill="none"
              strokeOpacity="0.6"
              transform="scale(0.7) rotate(90)"
            />
          </g>
        );
      })}
      <circle cx="28" cy="12" r="3" fill={a} fillOpacity="0.5" />
      <circle cx="28" cy="388" r="3" fill={a} fillOpacity="0.5" />
    </svg>
  );
}

/** Угловые элементы — усиленный орнамент в четырёх углах */
function KazakhCorner({ color, accent, flipX, flipY }: FrameProps & { flipX?: boolean; flipY?: boolean }) {
  const c = color ?? KAZAKH_THEME.blue;
  const a = accent ?? KAZAKH_THEME.gold;
  const scaleX = flipX ? -1 : 1;
  const scaleY = flipY ? -1 : 1;
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className="block h-full w-full"
      style={{ transform: `scale(${scaleX}, ${scaleY})` }}
      aria-hidden
    >
      <path d="M8 8h64v64H8z" stroke={c} strokeWidth="0.8" strokeOpacity="0.2" fill="none" />
      <path
        d="M8 40c16-20 32-28 48-20s20 28 12 44"
        stroke={a}
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8 40c12-14 24-18 36-12s14 20 8 32"
        stroke={c}
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M20 20l12 12M20 32l8 4" stroke={a} strokeWidth="1" strokeLinecap="round" />
      <path d="M12 52l10-6 8 10" stroke={c} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
      <circle cx="40" cy="40" r="5" stroke={a} strokeWidth="1" fill={`${a}20`} />
    </svg>
  );
}

export default function KazakhOrnamentFrame({
  color = KAZAKH_THEME.blue,
  accent = KAZAKH_THEME.gold,
}: FrameProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {/* верх */}
      <div className="absolute left-[44px] right-[44px] top-[20px] h-[76px]">
        <KazakhBorderBand color={color} accent={accent} />
      </div>
      {/* низ */}
      <div className="absolute bottom-[20px] left-[44px] right-[44px] h-[76px]">
        <KazakhBorderBand color={color} accent={accent} mirror />
      </div>
      {/* лево */}
      <div className="absolute bottom-[96px] left-[14px] top-[96px] w-[52px]">
        <KazakhSideStrip color={color} accent={accent} />
      </div>
      {/* право */}
      <div className="absolute bottom-[96px] right-[14px] top-[96px] w-[52px]">
        <div className="h-full w-full" style={{ transform: 'scaleX(-1)' }}>
          <KazakhSideStrip color={color} accent={accent} />
        </div>
      </div>
      {/* углы */}
      <div className="absolute left-[8px] top-[8px] h-[72px] w-[72px]">
        <KazakhCorner color={color} accent={accent} />
      </div>
      <div className="absolute right-[8px] top-[8px] h-[72px] w-[72px]">
        <KazakhCorner color={color} accent={accent} flipX />
      </div>
      <div className="absolute bottom-[8px] left-[8px] h-[72px] w-[72px]">
        <KazakhCorner color={color} accent={accent} flipY />
      </div>
      <div className="absolute bottom-[8px] right-[8px] h-[72px] w-[72px]">
        <KazakhCorner color={color} accent={accent} flipX flipY />
      </div>
      {/* внутренняя рамка */}
      <div
        className="absolute border"
        style={{
          inset: '88px 68px 88px 68px',
          borderColor: `${color}33`,
        }}
      />
    </div>
  );
}
