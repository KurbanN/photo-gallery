create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  status text not null check (status in ('attending', 'maybe', 'declined')),
  comment text,
  source text not null default 'web',
  created_at timestamptz not null default now()
);

create index if not exists idx_rsvp_responses_event_id_created_at
  on public.rsvp_responses (event_id, created_at desc);

alter table public.rsvp_responses enable row level security;

drop policy if exists "public_rsvp_insert" on public.rsvp_responses;
create policy "public_rsvp_insert"
  on public.rsvp_responses
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "owner_rsvp_select" on public.rsvp_responses;
create policy "owner_rsvp_select"
  on public.rsvp_responses
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
  );
