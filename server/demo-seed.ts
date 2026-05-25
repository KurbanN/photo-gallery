import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { getBucket, getSupabase } from './supabase.js';
import { mimeFromFilename } from './photos.js';
import type { EventRow } from './types.js';

const DEMO_SEED_PREFIX = 'demo-seed/';
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif']);

const DEMO_AUTHORS = ['Айгуль', 'Данияр', 'Гость', 'Стол 12', 'Бауыржан', 'Семья'];

function resolveDemoPhotoDir(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(process.cwd(), 'demo-photo'),
    path.join(here, '..', 'demo-photo'),
  ];
  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }
  return null;
}

/** Загружает стартовые фото из /demo-photo в демо-мероприятие (идемпотентно). */
export async function seedDemoPhotos(event: EventRow): Promise<number> {
  const dir = resolveDemoPhotoDir();
  if (!dir) {
    console.warn('[demo-seed] папка demo-photo не найдена');
    return 0;
  }

  const files = readdirSync(dir)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort();
  if (files.length === 0) return 0;

  const supabase = getSupabase();
  const bucket = getBucket();

  const { data: existing, error: listErr } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('event_id', event.id)
    .like('storage_path', `%/${DEMO_SEED_PREFIX}%`);
  if (listErr) throw listErr;

  const seededNames = new Set(
    (existing ?? []).map((row) => path.basename(row.storage_path as string)),
  );

  let added = 0;
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    if (seededNames.has(filename)) continue;

    const buffer = readFileSync(path.join(dir, filename));
    const id = randomUUID();
    const storagePath = `events/${event.id}/${DEMO_SEED_PREFIX}${filename}`;
    const contentType = mimeFromFilename(filename);
    const author = DEMO_AUTHORS[i % DEMO_AUTHORS.length];
    const createdAt = new Date(Date.now() - (files.length - i) * 45 * 60_000).toISOString();

    const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
      contentType,
      upsert: false,
    });
    if (upErr) {
      console.error('[demo-seed] storage upload:', filename, upErr.message);
      continue;
    }

    const { error: insErr } = await supabase.from('photos').insert({
      id,
      event_id: event.id,
      storage_path: storagePath,
      status: 'approved',
      author,
      created_at: createdAt,
    });
    if (insErr) {
      console.error('[demo-seed] db insert:', filename, insErr.message);
      await supabase.storage.from(bucket).remove([storagePath]).catch(() => {});
      continue;
    }
    added += 1;
  }

  if (added > 0) console.log(`[demo-seed] добавлено ${added} фото в /e/demo`);
  return added;
}
