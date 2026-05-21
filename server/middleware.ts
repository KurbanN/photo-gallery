import rateLimit from 'express-rate-limit';

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Лимит загрузок с этого устройства. Попробуйте позже.' },
});

export function corsOrigins(): string[] | boolean {
  const raw = process.env.ALLOWED_ORIGINS?.trim();
  if (!raw) return true;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
