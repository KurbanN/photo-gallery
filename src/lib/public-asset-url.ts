/** Путь к файлу из public/ с учётом VITE_BASE_PATH (GitHub Pages). */
export function publicAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const normalized = path.replace(/^\//, '');
  return `${base}${normalized}`;
}
