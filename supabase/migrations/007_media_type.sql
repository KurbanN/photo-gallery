-- Тип медиа: фото или видео
alter table public.photos
  add column if not exists media_type text not null default 'image'
  check (media_type in ('image', 'video'));

update public.photos
set media_type = 'video'
where media_type = 'image'
  and storage_path ~* '\.(mp4|mov|webm|m4v|mkv|3gp)$';
