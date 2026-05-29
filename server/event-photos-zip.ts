import path from 'path';
import type archiver from 'archiver';
import { getBucket, getSupabase } from './supabase.js';
import type { MediaType, PhotoRow } from './types.js';

function mediaTypeFromRow(row: PhotoRow): MediaType {
  if (row.media_type === 'video') return 'video';
  if (/\.(mp4|mov|webm|m4v|mkv|3gp)$/i.test(row.storage_path)) return 'video';
  return 'image';
}

function sanitizeNamePart(raw: string): string {
  const trimmed = raw.trim().slice(0, 40);
  const safe = trimmed.replace(/[^\w\u0400-\u04FF.-]+/gi, '_').replace(/^_+|_+$/g, '');
  return safe || 'guest';
}

function zipEntryPath(index: number, row: PhotoRow): string {
  const ext = path.extname(row.storage_path) || '.jpg';
  const mediaType = mediaTypeFromRow(row);
  const folder = mediaType === 'video' ? 'videos' : 'photos';
  const num = String(index + 1).padStart(4, '0');
  const author = row.author ? `${sanitizeNamePart(row.author)}-` : '';
  return `${folder}/${num}-${author}${row.id.slice(0, 8)}${ext}`;
}

export async function listPhotoRowsForZip(eventId: string): Promise<PhotoRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('photos')
    .select('id, storage_path, created_at, author, status, media_type')
    .eq('event_id', eventId)
    .neq('status', 'rejected')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PhotoRow[];
}

export async function appendEventPhotosToArchive(
  eventId: string,
  archive: archiver.Archiver,
  rows?: PhotoRow[],
): Promise<{ added: number; skipped: number }> {
  const list = rows ?? (await listPhotoRowsForZip(eventId));
  if (list.length === 0) return { added: 0, skipped: 0 };

  const supabase = getSupabase();
  const bucket = getBucket();
  let added = 0;
  let skipped = 0;

  for (let i = 0; i < list.length; i++) {
    const row = list[i]!;
    const { data: fileData, error: dlErr } = await supabase.storage
      .from(bucket)
      .download(row.storage_path);
    if (dlErr || !fileData) {
      skipped += 1;
      continue;
    }
    const buf = Buffer.from(await fileData.arrayBuffer());
    archive.append(buf, { name: zipEntryPath(i, row) });
    added += 1;
  }

  return { added, skipped };
}
