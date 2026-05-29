import 'dotenv/config';
import express from 'express';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSupabase } from './supabase.js';
import { ensureDemoEvent, ensureLegacyEvent } from './events-db.js';
import { corsOrigins, createCorsMiddleware } from './middleware.js';
import { guestRouter } from './routes/guest.js';
import { legacyRouter } from './routes/legacy.js';
import { organizerRouter } from './routes/organizer.js';
import { adminRouter } from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 8787;

export function createApp() {
  const app = express();
  app.use(createCorsMiddleware());
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    const hasSb = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const cors = corsOrigins();
    res.json({
      ok: true,
      supabaseConfigured: hasSb,
      saas: true,
      corsOrigins: cors === true ? 'all' : cors,
    });
  });

  app.use('/api/v1/e', guestRouter());
  app.use('/api/v1/organizer', organizerRouter());
  app.use('/api/v1/admin', adminRouter());
  app.use('/api', legacyRouter());

  const distPath = path.join(ROOT, 'dist');
  if (existsSync(distPath)) {
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) next(err);
      });
    });
  }

  return app;
}

async function main() {
  getSupabase();
  try {
    await ensureDemoEvent();
  } catch (e) {
    console.warn('[startup] demo event seed skipped:', e);
  }
  try {
    await ensureLegacyEvent();
  } catch (e) {
    console.warn('[startup] legacy event seed skipped:', e);
  }
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[live-photo] http://127.0.0.1:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
