import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSupabase } from './supabase.js';
import { ensureDemoEvent, ensureLegacyEvent } from './events-db.js';
import { corsOrigins } from './middleware.js';
import { guestRouter } from './routes/guest.js';
import { legacyRouter } from './routes/legacy.js';
import { organizerRouter } from './routes/organizer.js';
import { adminRouter } from './routes/admin.js';
import { inviteRouter } from './routes/invite.js';
import { getInviteBySlug } from './invite-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 8787;
let distIndexCache: string | null = null;

export function createApp() {
  const app = express();
  const origins = corsOrigins();
  app.use(
    cors(
      typeof origins === 'boolean'
        ? undefined
        : { origin: origins, credentials: true },
    ),
  );
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    const hasSb = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    res.json({
      ok: true,
      supabaseConfigured: hasSb,
      saas: true,
    });
  });

  app.use('/api/v1/e', guestRouter());
  app.use('/api/v1/invite', inviteRouter());
  app.use('/api/v1/organizer', organizerRouter());
  app.use('/api/v1/admin', adminRouter());
  app.use('/api', legacyRouter());

  app.get('/api/v1/invite/:slug/og-image.svg', async (req, res) => {
    try {
      const invite = await getInviteBySlug(req.params.slug);
      if (!invite) {
        res.status(404).send('Not found');
        return;
      }
      const dateLabel = invite.date
        ? new Date(invite.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : 'Дата уточняется';
      const title = escapeHtml(invite.title.slice(0, 72));
      const location = escapeHtml((invite.location || 'Allmemories').slice(0, 72));
      const bg = invite.template === 'dark' ? '#1A1814' : '#FAFAF7';
      const fg = invite.template === 'dark' ? '#F5F3EE' : '#2C2C2A';
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${bg}"/>
  <rect x="48" y="48" width="1104" height="534" fill="none" stroke="#C9A96E" stroke-width="2"/>
  <text x="86" y="210" font-size="64" font-family="Georgia, serif" fill="${fg}">${title}</text>
  <text x="86" y="300" font-size="34" font-family="Inter, Arial, sans-serif" fill="#C9A96E">${escapeHtml(
    dateLabel,
  )}</text>
  <text x="86" y="360" font-size="28" font-family="Inter, Arial, sans-serif" fill="${fg}">${location}</text>
  <text x="86" y="540" font-size="20" font-family="Inter, Arial, sans-serif" fill="${fg}" opacity="0.75">Allmemories — цифровое приглашение</text>
</svg>`;
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.send(svg);
    } catch (e) {
      console.error(e);
      res.status(500).send('error');
    }
  });

  const distPath = path.join(ROOT, 'dist');
  if (existsSync(distPath)) {
    app.get('/invite/:slug', async (req, res, next) => {
      try {
        const invite = await getInviteBySlug(req.params.slug);
        if (!invite) return next();
        const urlBase = publicBaseUrl(req);
        const pageUrl = `${urlBase}/invite/${encodeURIComponent(invite.slug)}`;
        const ogImageUrl = `${urlBase}/api/v1/invite/${encodeURIComponent(invite.slug)}/og-image.svg`;
        const dateLabel = invite.date
          ? new Date(invite.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : '';
        const description = [dateLabel, invite.location].filter(Boolean).join(' • ') || 'Цифровое приглашение';
        const html = await loadDistIndex(distPath);
        const withMeta = injectHeadMeta(
          html,
          buildOgTags({
            title: invite.title,
            description,
            url: pageUrl,
            imageUrl: ogImageUrl,
          }),
        );
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(withMeta);
      } catch (e) {
        next(e);
      }
    });
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

async function loadDistIndex(distPath: string): Promise<string> {
  if (distIndexCache) return distIndexCache;
  distIndexCache = await readFile(path.join(distPath, 'index.html'), 'utf8');
  return distIndexCache;
}

function publicBaseUrl(req: express.Request): string {
  const app = process.env.APP_PUBLIC_URL?.trim();
  if (app) return app.replace(/\/+$/, '');
  const protocol = req.header('x-forwarded-proto') || req.protocol;
  return `${protocol}://${req.get('host')}`;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildOgTags(input: { title: string; description: string; url: string; imageUrl: string }): string {
  const title = escapeHtml(input.title);
  const description = escapeHtml(input.description);
  const url = escapeHtml(input.url);
  const imageUrl = escapeHtml(input.imageUrl);
  return [
    `<title>${title} — Allmemories</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${imageUrl}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${imageUrl}" />`,
    `<link rel="canonical" href="${url}" />`,
  ].join('\n');
}

function injectHeadMeta(html: string, meta: string): string {
  const closeHead = '</head>';
  const idx = html.indexOf(closeHead);
  if (idx === -1) return html;
  return `${html.slice(0, idx)}\n${meta}\n${html.slice(idx)}`;
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
