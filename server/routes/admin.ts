import { Router } from 'express';
import { getOrganizer, requireAdmin } from '../auth.js';
import { deleteEvent } from '../events-db.js';
import {
  addClientEventSlot,
  grantAccessByEmail,
  listOrganizersAndInvites,
  revokeOrganizerAccess,
  type GrantableRole,
} from '../roles-db.js';
import { withEventQuota } from '../client-quota.js';

export function adminRouter(): Router {
  const router = Router();
  router.use(requireAdmin);

  router.get('/organizers', async (_req, res) => {
    try {
      const data = await listOrganizersAndInvites();
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка списка' });
    }
  });

  router.post('/organizers/grant', async (req, res) => {
    try {
      const admin = getOrganizer(req);
      const body = req.body as { email?: string; role?: GrantableRole };
      const email = body.email;
      if (!email?.trim()) {
        res.status(400).json({ error: 'Укажите email' });
        return;
      }
      const grantRole: GrantableRole = body.role === 'client' ? 'client' : 'organizer';
      const result = await grantAccessByEmail(admin.id, email, grantRole);
      const roleLabel = grantRole === 'client' ? 'клиента (1 мероприятие)' : 'организатора';
      res.status(201).json({
        ...result,
        role: grantRole,
        message:
          result.status === 'promoted'
            ? `Пользователь уже был в системе — роль ${roleLabel} выдана.`
            : `Приглашение сохранено. После входа по этому email откроется роль ${roleLabel}.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'CANNOT_GRANT_ADMIN') {
        res.status(400).json({ error: 'Этот email — администратор платформы' });
        return;
      }
      console.error(e);
      res.status(500).json({ error: 'Не удалось выдать доступ' });
    }
  });

  router.post('/organizers/:id/add-event-slot', async (req, res) => {
    try {
      const updated = await addClientEventSlot(req.params.id);
      const profile = await withEventQuota(updated);
      res.json({
        ok: true,
        profile,
        message: `Лимит мероприятий: ${profile.event_create_limit ?? 0} (создано: ${profile.events_created})`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'NOT_FOUND') {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }
      if (msg === 'NOT_CLIENT') {
        res.status(400).json({ error: 'Доп. слоты только для роли client' });
        return;
      }
      console.error(e);
      res.status(500).json({ error: 'Не удалось увеличить лимит' });
    }
  });

  router.delete('/events/:id', async (req, res) => {
    try {
      await deleteEvent(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      if (e instanceof Error && e.message === 'NOT_FOUND') {
        res.status(404).json({ error: 'Мероприятие не найдено' });
        return;
      }
      console.error(e);
      res.status(500).json({ error: 'Не удалось удалить мероприятие' });
    }
  });

  router.post('/organizers/revoke', async (req, res) => {
    try {
      const email = (req.body as { email?: string }).email;
      if (!email?.trim()) {
        res.status(400).json({ error: 'Укажите email' });
        return;
      }
      await revokeOrganizerAccess(email);
      res.json({ ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'CANNOT_REVOKE_ADMIN') {
        res.status(400).json({ error: 'Нельзя отозвать роль администратора' });
        return;
      }
      console.error(e);
      res.status(500).json({ error: 'Ошибка' });
    }
  });

  return router;
}
