import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Лимит загрузок с этого устройства. Попробуйте позже.' },
});

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/** Продакшен-домены — всегда разрешены, даже если забыли env на Railway. */
const BUILTIN_ORIGINS = [
  'https://allmemories.live',
  'https://www.allmemories.live',
];

/**
 * Список origins для CORS.
 * `true` = разрешить все (только dev без явной конфигурации).
 */
export function corsOrigins(): string[] | true {
  const origins = new Set<string>(BUILTIN_ORIGINS);

  const appUrl = process.env.APP_PUBLIC_URL?.trim();
  if (appUrl) origins.add(normalizeOrigin(appUrl));

  const raw = process.env.ALLOWED_ORIGINS?.trim();
  if (raw) {
    for (const part of raw.split(',')) {
      const o = normalizeOrigin(part);
      if (o) origins.add(o);
    }
  }

  if (process.env.NODE_ENV !== 'production' && origins.size === BUILTIN_ORIGINS.length) {
    return true;
  }

  return [...origins];
}

/** Express CORS с credentials и явной проверкой origin (preflight OPTIONS обрабатывает пакет cors). */
export function createCorsMiddleware() {
  const allowed = corsOrigins();

  if (allowed === true) {
    return cors({ credentials: true });
  }

  const list = allowed;

  return cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      const ok = list.includes(normalizeOrigin(origin));
      if (!ok) console.warn('[cors] blocked origin:', origin);
      callback(null, ok);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
