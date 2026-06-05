create table if not exists public.event_guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  first_name text not null,
  last_name text not null default '',
  full_name text generated always as (
    trim(both from first_name || ' ' || nullif(trim(last_name), ''))
  ) stored,
  table_number text not null,
  seat_number text,
  phone text,
  group_name text,
  notes text,
  search_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_guests_event_id on public.event_guests (event_id);
create index if not exists idx_event_guests_event_table on public.event_guests (event_id, table_number);
create index if not exists idx_event_guests_event_search on public.event_guests (event_id, search_text);

alter table public.event_guests enable row level security;

drop policy if exists "owner_guests_all" on public.event_guests;
create policy "owner_guests_all"
  on public.event_guests
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.organizer_id = auth.uid()
    )
  );
