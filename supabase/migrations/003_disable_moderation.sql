-- Отключить модерацию для всех мероприятий; показать зависшие pending в ленте
update public.events set moderation_enabled = false where moderation_enabled = true;
update public.photos set status = 'approved' where status = 'pending';
