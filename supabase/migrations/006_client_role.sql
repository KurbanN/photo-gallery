-- Роль client: лимит создания мероприятий (по умолчанию 1), админ может +1

alter table public.organizers drop constraint if exists organizers_role_check;
alter table public.organizers
  add constraint organizers_role_check
  check (role in ('admin', 'organizer', 'client', 'pending'));

alter table public.organizers
  add column if not exists event_create_limit int;

comment on column public.organizers.event_create_limit is
  'Макс. число мероприятий для client; NULL = без лимита (admin/organizer)';

update public.organizers set event_create_limit = null where role in ('admin', 'organizer');
update public.organizers set event_create_limit = 0 where role = 'pending';
update public.organizers set event_create_limit = 1 where role = 'client';

alter table public.organizer_invites
  add column if not exists role text not null default 'organizer'
  check (role in ('organizer', 'client'));
