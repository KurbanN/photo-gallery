import { Router } from 'express';
import { getOrganizer, requireEventManager } from '../auth.js';
import { getEventById } from '../events-db.js';
import { createRSVP, getInviteByEventId, getInviteBySlug, listRSVPsByEventId, upsertInviteSettings } from '../invite-db.js';

export function inviteRouter(): Router {
  const router = Router();

  router.get('/:slug', async (req, res) => {
    try {
      const invite = await getInviteBySlug(req.params.slug);
      if (!invite) {
        res.status(404).json({ error: 'Приглашение не найдено' });
        return;
      }
      res.json({ invite });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка загрузки приглашения' });
    }
  });

  router.post('/:slug/rsvp', async (req, res) => {
    try {
      const invite = await getInviteBySlug(req.params.slug);
      if (!invite) {
        res.status(404).json({ error: 'Приглашение не найдено' });
        return;
      }
      const body = req.body as { name?: string; status?: 'attending' | 'maybe' | 'declined'; comment?: string };
      const name = body.name?.trim() || '';
      if (!name) {
        res.status(400).json({ error: 'Укажите имя' });
        return;
      }
      if (!body.status || !['attending', 'maybe', 'declined'].includes(body.status)) {
        res.status(400).json({ error: 'Выберите статус ответа' });
        return;
      }
      const row = await createRSVP({
        eventId: invite.eventId,
        name,
        status: body.status,
        comment: body.comment,
      });
      res.status(201).json({ response: row });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Не удалось отправить RSVP' });
    }
  });

  router.use('/manage', requireEventManager);

  router.get('/manage/event/:eventId', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.eventId);
      if (!event || (org.role !== 'admin' && event.organizer_id !== org.id)) {
        res.status(404).json({ error: 'Событие не найдено' });
        return;
      }
      const invite = await getInviteByEventId(event.id);
      const responses = await listRSVPsByEventId(event.id);
      res.json({ invite, responses });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка загрузки invite-данных' });
    }
  });

  router.patch('/manage/event/:eventId', async (req, res) => {
    try {
      const org = getOrganizer(req);
      const event = await getEventById(req.params.eventId);
      if (!event || (org.role !== 'admin' && event.organizer_id !== org.id)) {
        res.status(404).json({ error: 'Событие не найдено' });
        return;
      }
      const body = req.body as {
        title?: string;
        startsAt?: string | null;
        template?: 'classic' | 'dark';
        label?: string;
        quote?: string;
        venueName?: string;
        location?: string;
        city?: string;
        mapUrl?: string;
        message?: string;
      };
      const invite = await upsertInviteSettings(event.id, org.id, {
        title: body.title?.trim() || event.title,
        startsAt: body.startsAt ?? event.starts_at,
        template: body.template === 'dark' ? 'dark' : 'classic',
        label: body.label ?? ((event.settings || {}).inviteLabel as string) ?? 'Wedding Day',
        quote: body.quote ?? ((event.settings || {}).inviteQuote as string) ?? 'С этого дня — навсегда.',
        venueName: body.venueName ?? ((event.settings || {}).inviteVenueName as string) ?? '',
        location: body.location ?? ((event.settings || {}).inviteLocation as string) ?? '',
        city: body.city ?? ((event.settings || {}).inviteCity as string) ?? '',
        mapUrl: body.mapUrl ?? ((event.settings || {}).inviteMapUrl as string) ?? '',
        message: body.message ?? ((event.settings || {}).inviteMessage as string) ?? '',
      });
      res.json({ invite });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка сохранения invite' });
    }
  });

  return router;
}
