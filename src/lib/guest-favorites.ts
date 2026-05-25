function favKey(slug: string): string {
  return `live-photo-fav-${slug}`;
}

export function getFavoriteIds(slug: string): Set<string> {
  try {
    const raw = localStorage.getItem(favKey(slug));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

export function toggleFavorite(slug: string, photoId: string): boolean {
  const set = getFavoriteIds(slug);
  if (set.has(photoId)) {
    set.delete(photoId);
  } else {
    set.add(photoId);
  }
  localStorage.setItem(favKey(slug), JSON.stringify([...set]));
  return set.has(photoId);
}

export function isFavorite(slug: string, photoId: string): boolean {
  return getFavoriteIds(slug).has(photoId);
}
