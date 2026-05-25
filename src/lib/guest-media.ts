import type { PhotoEntry } from './guest-api';

export type FeedFilter = 'photo' | 'video' | 'favorites';

export function mediaTypeOf(p: PhotoEntry): 'image' | 'video' {
  return p.mediaType ?? 'image';
}

export function filterFeedItems(
  items: PhotoEntry[],
  filter: FeedFilter,
  favoriteIds: Set<string>,
): PhotoEntry[] {
  if (filter === 'favorites') {
    return items.filter((p) => favoriteIds.has(p.id));
  }
  if (filter === 'video') {
    return items.filter((p) => mediaTypeOf(p) === 'video');
  }
  return items.filter((p) => mediaTypeOf(p) === 'image');
}

export function isProbablyMediaFile(file: File): boolean {
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?|mp4|mov|webm|m4v|mkv|3gp)$/i.test(
    file.name?.trim() ?? '',
  );
}
