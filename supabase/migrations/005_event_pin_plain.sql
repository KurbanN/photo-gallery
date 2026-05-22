-- Храним PIN в открытом виде только для кабинета организатора/админа (гостям не отдаём).
alter table public.events add column if not exists pin_plain text;
