import { Router } from 'express';
import archiver from 'archiver';
import multer from 'multer';
import QRCode from 'qrcode';
import { appendEventPhotosToArchive, listPhotoRowsForZip } from '../event-photos-zip.js';
import { assertCanCreateEvent, withEventQuota } from '../client-quota.js';
import { getOrganizer, requireOrganizer, requireEventManager } from '../auth.js';
import type { AuthUser } from '../auth.js';
import {
  createEvent,
  getEventById,
  listEventsForProfile,
  organizerEventView,
  slugify,
  updateEvent,
} from '../events-db.js';
import type { EventRow } from '../types.js';

function canAccessEvent(event: EventRow, org: AuthUser): boolean {
  return org.role === 'admin' || event.organizer_id === org.id;
}
import {
  deletePhotoForEvent,
  listPhotosForOrganizer,
  uploadEventLoginBg,
} from '../photos.js';
import { generatePin } from '../pin.js';
import type { EventPlan, EventSettings, EventGuestInput } from '../types.js';
import {
  countEventGuests,
  countEventTables,
  createEventGuest,
  deleteEventGuest,
  guestsToCsv,
  importEventGuests,
  listAllGuestsForExport,
  listDistinctTables,
  listEventGuests,
  sanitizeGuestInput,
  updateEventGuest,
} from '../guests-db.js';

function guestBaseUrl(): string {
  const app = process.env.APP_PUBLIC_URL?.trim();
  if (app) return app.replace(/\/+$/, '');
  return 'http://localhost:5174';
}

const brandingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Только изображения'));
  },
});

export function organizerRouter(): Router {
  const router = Router();

  router.get('/me', requireOrganizer, async (req, res) => {
    try {
      const profile = await withEventQuota(getOrganizer(req));
      res.json({ profile });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка профиля' });
    }
  });

  router.use(requireEventManager);

  router.get('/events', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const events = await listEventsForProfile(org);
      res.json({ events: events.map(organizerEventView) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка списка' });
    }
  });

  router.post('/events', async (req, res) => {
    try {
      const org = getOrganizer(req);
      try {
        await assertCanCreateEvent(org);
      } catch (e) {
        if (e instanceof Error && e.message === 'EVENT_CREATE_LIMIT') {
          res.status(403).json({
            error: 'Достигнут лимит мероприятий',
            hint: 'Попросите администратора выдать разрешение на ещё одно мероприятие.',
          });
          return;
        }
        throw e;
      }
      const body = req.body as {
        title?: string;
        slug?: string;
        pin?: string;
        plan?: EventPlan;
        startsAt?: string;
        endsAt?: string;
        settings?: EventSettings;
      };
      const title = (body.title || 'Мероприятие').trim();
      const slug = slugify(body.slug || title);
      const pin = body.pin?.trim() || generatePin();
      const event = await createEvent({
        slug,
        title,
        pin,
        plan: body.plan,
        startsAt: body.startsAt ?? null,
        endsAt: body.endsAt ?? null,
        settings: body.settings,
        organizerId: org.id,
        organizerEmail: org.email ?? undefined,
      });
      res.status(201).json({
        event: organizerEventView(event),
        pin,
        guestUrl: `${guestBaseUrl()}/e/${event.slug}`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'EVENT_CREATE_LIMIT') {
        res.status(403).json({
          error: 'Достигнут лимит мероприятий',
          hint: 'Попросите администратора выдать разрешение на ещё одно мероприятие.',
        });
        return;
      }
      if (/duplicate|unique/i.test(msg)) {
        res.status(409).json({ error: 'Такой адрес (slug) уже занят' });
        return;
      }
      console.error(e);
      res.status(500).json({ error: 'Не удалось создать мероприятие' });
    }
  });

  router.get('/events/:id', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      res.json({
        event: organizerEventView(event),
        guestUrl: `${guestBaseUrl()}/e/${event.slug}`,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка' });
    }
  });

  router.patch('/events/:id', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const body = req.body as {
        title?: string;
        status?: 'draft' | 'active' | 'ended' | 'archived';
        endsAt?: string | null;
        settings?: EventSettings;
        pin?: string;
      };
      const event = await updateEvent(req.params.id, org.id, {
        title: body.title,
        status: body.status,
        ends_at: body.endsAt,
        settings: body.settings,
        pin: body.pin,
      });
      res.json({ event: organizerEventView(event), pin: event.pin_plain ?? null });
    } catch (e) {
      if (e instanceof Error && e.message === 'NOT_FOUND') {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      console.error(e);
      res.status(500).json({ error: 'Ошибка обновления' });
    }
  });

  router.post(
    '/events/:id/login-bg',
    (req, res, next) => {
      brandingUpload.single('image')(req, res, (err: unknown) => {
        if (err) {
          const msg = err instanceof Error ? err.message : 'Ошибка файла';
          res.status(400).json({ error: msg });
          return;
        }
        next();
      });
    },
    async (req, res) => {
      try {
        const org = getOrganizer(req);
        const event = await getEventById(req.params.id);
        if (!event || !canAccessEvent(event, org)) {
          res.status(404).json({ error: 'Не найдено' });
          return;
        }
        if (!req.file?.buffer) {
          res.status(400).json({ error: 'Выберите изображение' });
          return;
        }
        const loginBgUrl = await uploadEventLoginBg(
          event.id,
          req.file.buffer,
          req.file.originalname || 'bg.jpg',
          req.file.mimetype,
        );
        const settings: EventSettings = {
          ...((event.settings || {}) as EventSettings),
          loginBgUrl,
        };
        const updated = await updateEvent(event.id, org.id, { settings });
        res.json({ loginBgUrl, event: organizerEventView(updated) });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Не удалось загрузить фон' });
      }
    },
  );

  router.get('/events/:id/photos', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const photos = await listPhotosForOrganizer(event.id);
      res.json({ photos });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка' });
    }
  });

  router.get('/events/:id/photos/download.zip', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const rows = await listPhotoRowsForZip(event.id);
      if (rows.length === 0) {
        res.status(404).json({ error: 'В галерее пока нет файлов для архива' });
        return;
      }

      const asciiName = `${event.slug}-photos.zip`.replace(/[^\x20-\x7E]/g, '_');
      const utf8Name = `${event.slug}-photos.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(utf8Name)}`,
      );

      const archive = archiver('zip', { zlib: { level: 6 } });
      archive.on('error', (err) => {
        console.error('ZIP archive error:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Ошибка архива' });
        else res.end();
      });
      archive.pipe(res);

      await appendEventPhotosToArchive(event.id, archive, rows);
      await archive.finalize();
    } catch (e) {
      console.error(e);
      if (!res.headersSent) res.status(500).json({ error: 'Не удалось собрать архив' });
    }
  });

  router.delete('/events/:id/photos/:photoId', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      await deletePhotoForEvent(event.id, req.params.photoId);
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Не удалось удалить' });
    }
  });

  router.get('/events/:id/qr', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const url = `${guestBaseUrl()}/e/${event.slug}`;
      const png = await QRCode.toBuffer(url, { width: 512, margin: 2 });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="qr-${event.slug}.png"`);
      res.send(png);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'QR ошибка' });
    }
  });

  router.get('/events/:id/seats/qr', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const url = `${guestBaseUrl()}/e/${event.slug}/seats`;
      const png = await QRCode.toBuffer(url, { width: 512, margin: 2 });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="qr-seats-${event.slug}.png"`);
      res.send(png);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'QR ошибка' });
    }
  });

  router.get('/events/:id/guests/stats', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const [total, tables] = await Promise.all([
        countEventGuests(event.id),
        countEventTables(event.id),
      ]);
      res.json({ total, tables });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка' });
    }
  });

  router.get('/events/:id/guests/tables', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const tables = await listDistinctTables(event.id);
      res.json({ tables });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка' });
    }
  });

  router.get('/events/:id/guests', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const table = typeof req.query.table === 'string' ? req.query.table : undefined;
      const data = await listEventGuests(event.id, { page, limit, q, table });
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка списка гостей' });
    }
  });

  router.get('/events/:id/guests/export', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const guests = await listAllGuestsForExport(event.id);
      const csv = guestsToCsv(guests);
      const filename = `${event.slug}-guests.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      );
      res.send(csv);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка экспорта' });
    }
  });

  router.post('/events/:id/guests', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const body = req.body as EventGuestInput;
      const guest = await createEventGuest(event.id, body);
      res.status(201).json({ guest });
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'FIRST_NAME_REQUIRED') {
          res.status(400).json({ error: 'Укажите имя гостя' });
          return;
        }
        if (e.message === 'TABLE_REQUIRED') {
          res.status(400).json({ error: 'Укажите номер стола' });
          return;
        }
      }
      console.error(e);
      res.status(500).json({ error: 'Не удалось добавить гостя' });
    }
  });

  router.post('/events/:id/guests/import', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const body = req.body as { guests?: EventGuestInput[]; mode?: 'replace' | 'append' };
      const guests = body.guests ?? [];
      const mode = body.mode === 'replace' ? 'replace' : 'append';
      if (guests.length === 0) {
        res.status(400).json({ error: 'Список гостей пуст' });
        return;
      }
      const validated: EventGuestInput[] = [];
      const errors: string[] = [];
      guests.forEach((g, i) => {
        try {
          validated.push(sanitizeGuestInput(g));
        } catch {
          errors.push(`Строка ${i + 1}: пропущена (нет имени или стола)`);
        }
      });
      if (validated.length === 0) {
        res.status(400).json({ error: 'Нет валидных строк для импорта', errors });
        return;
      }
      const result = await importEventGuests(event.id, validated, mode);
      res.json({ ...result, skipped: guests.length - validated.length, errors });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка импорта' });
    }
  });

  router.patch('/events/:id/guests/:guestId', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      const body = req.body as EventGuestInput;
      const guest = await updateEventGuest(event.id, req.params.guestId, body);
      res.json({ guest });
    } catch (e) {
      if (e instanceof Error && e.message === 'NOT_FOUND') {
        res.status(404).json({ error: 'Гость не найден' });
        return;
      }
      console.error(e);
      res.status(500).json({ error: 'Не удалось обновить' });
    }
  });

  router.delete('/events/:id/guests/:guestId', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.id);
      if (!event || !canAccessEvent(event, org)) {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      await deleteEventGuest(event.id, req.params.guestId);
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Не удалось удалить' });
    }
  });

  router.post('/events/:id/end', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await updateEvent(req.params.id, org.id, {
        status: 'ended',
        ends_at: new Date().toISOString(),
      });
      res.json({ event: organizerEventView(event) });
    } catch (e) {
      if (e instanceof Error && e.message === 'NOT_FOUND') {
        res.status(404).json({ error: 'Не найдено' });
        return;
      }
      res.status(500).json({ error: 'Ошибка' });
    }
  });

  return router;
}
