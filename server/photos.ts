import path from 'path';
import { randomUUID } from 'crypto';
import { getBucket, getSupabase } from './supabase.js';
import type { EventRow, MediaType, PhotoEntry, PhotoRow, PhotoStatus } from './types.js';
import { countEventPhotos } from './events-db.js';

export function publicUrlForPath(storagePath: string): string {
  const supabase = getSupabase();
  const bucket = getBucket();
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

/** Обход кэша CDN/браузера при повторной загрузке в тот же путь Storage. */
export function loginBgUrlWithCacheBust(publicUrl: string): string {
  const base = publicUrl.split('?')[0] ?? publicUrl;
  return `${base}?v=${Date.now()}`;
}

export function mimeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.m4v': 'video/x-m4v',
    '.mkv': 'video/x-matroska',
    '.3gp': 'video/3gpp',
  };
  return map[ext] ?? 'application/octet-stream';
}

export function resolveMediaType(mimetype: string, filename: string): MediaType {
  if (mimetype.startsWith('video/')) return 'video';
  const ext = path.extname(filename).toLowerCase();
  if (/\.(mp4|mov|webm|m4v|mkv|3gp)$/.test(ext)) return 'video';
  return 'image';
}

function mediaTypeFromRow(row: PhotoRow): MediaType {
  if (row.media_type === 'video') return 'video';
  if (/\.(mp4|mov|webm|m4v|mkv|3gp)$/i.test(row.storage_path)) return 'video';
  return 'image';
}

function rowToEntry(row: PhotoRow): PhotoEntry {
  return {
    id: row.id,
    url: publicUrlForPath(row.storage_path),
    createdAt: row.created_at,
    mediaType: mediaTypeFromRow(row),
    ...(row.author ? { author: row.author } : {}),
    status: row.status,
  };
}

export async function listPhotosForGuest(event: EventRow): Promise<PhotoEntry[]> {
  const supabase = getSupabase();
  let q = supabase
    .from('photos')
    .select('id, storage_path, created_at, author, status, media_type')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false });
  q = q.neq('status', 'rejected');
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as PhotoRow[]).map(rowToEntry);
}

export async function listPhotosForOrganizer(eventId: string): Promise<PhotoEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('photos')
    .select('id, storage_path, created_at, author, status, media_type')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as PhotoRow[]).map(rowToEntry);
}

export async function uploadPhotoForEvent(
  event: EventRow,
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  author?: string,
): Promise<PhotoEntry> {
  const count = await countEventPhotos(event.id);
  if (count >= event.photo_limit) {
    throw new Error('PHOTO_LIMIT');
  }
  const mediaType = resolveMediaType(mimetype, originalName);
  const ext =
    path.extname(originalName) ||
    (mediaType === 'video' ? '.mp4' : '.jpg');
  const id = randomUUID();
  const storagePath = `events/${event.id}/${id}${ext}`;
  const supabase = getSupabase();
  const bucket = getBucket();
  const contentType =
    mimetype.startsWith('image/') || mimetype.startsWith('video/')
      ? mimetype
      : mimeFromFilename(ext);
  const status: PhotoStatus = 'approved';

  const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });
  if (upErr) throw upErr;

  const { data: inserted, error: insErr } = await supabase
    .from('photos')
    .insert({
      id,
      event_id: event.id,
      storage_path: storagePath,
      status,
      media_type: mediaType,
      ...(author ? { author } : {}),
    })
    .select('id, storage_path, created_at, author, status, media_type')
    .single();
  if (insErr) {
    await supabase.storage.from(bucket).remove([storagePath]).catch(() => {});
    throw insErr;
  }
  return rowToEntry(inserted as PhotoRow);
}

export async function uploadEventLoginBg(
  eventId: string,
  buffer: Buffer,
  originalName: string,
  mimetype: string,
): Promise<string> {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
  const storagePath = `events/${eventId}/branding/login-bg${safeExt}`;
  const supabase = getSupabase();
  const bucket = getBucket();
  const contentType = mimetype.startsWith('image/') ? mimetype : mimeFromFilename(safeExt);
  const stalePaths = ['.jpg', '.jpeg', '.png', '.webp']
    .filter((ext) => ext !== safeExt)
    .map((ext) => `events/${eventId}/branding/login-bg${ext}`);
  if (stalePaths.length) {
    await supabase.storage.from(bucket).remove(stalePaths).catch(() => {});
  }
  const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (upErr) throw upErr;
  return loginBgUrlWithCacheBust(publicUrlForPath(storagePath));
}

export async function deletePhotoForEvent(eventId: string, photoId: string): Promise<void> {
  const supabase = getSupabase();
  const bucket = getBucket();
  const { data: row, error: fetchErr } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('id', photoId)
    .eq('event_id', eventId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!row?.storage_path) throw new Error('NOT_FOUND');
  const { error: delErr } = await supabase.from('photos').delete().eq('id', photoId);
  if (delErr) throw delErr;
  await supabase.storage.from(bucket).remove([row.storage_path]).catch(() => {});
}

export async function downloadPhotoBuffer(
  eventId: string,
  photoId: string,
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  const supabase = getSupabase();
  const bucket = getBucket();
  const { data: row, error: fetchErr } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('id', photoId)
    .eq('event_id', eventId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!row?.storage_path) throw new Error('NOT_FOUND');
  const { data: fileData, error: dlErr } = await supabase.storage.from(bucket).download(row.storage_path);
  if (dlErr || !fileData) throw new Error('NOT_FOUND');
  const base = path.basename(row.storage_path);
  const buf = Buffer.from(await fileData.arrayBuffer());
  return { buffer: buf, filename: base, contentType: mimeFromFilename(base) };
}
