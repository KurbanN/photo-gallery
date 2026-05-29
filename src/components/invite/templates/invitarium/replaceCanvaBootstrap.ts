/** Экранирование текста для поиска в Canva bootstrap JSON (внутри __bs). */
export function escapeCanvaFragment(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n');
}

export type ReplaceCanvaOptions = {
  /** Номер вхождения с 1; без replaceAll меняется только оно */
  occurrence?: number;
  /** По умолчанию true, если не задан occurrence */
  replaceAll?: boolean;
};

/** Замена текстового блока Canva в строке bootstrap. */
export function replaceCanvaInBootstrap(
  bootstrapStr: string,
  oldText: string,
  newText: string,
  options?: ReplaceCanvaOptions,
): string {
  if (!oldText) return bootstrapStr;
  const replaceAll = options?.replaceAll ?? options?.occurrence == null;
  if (oldText === newText && replaceAll) return bootstrapStr;

  const from = `"A":"${escapeCanvaFragment(oldText)}\\\\n"`;
  const to = `"A":"${escapeCanvaFragment(newText)}\\\\n"`;
  if (!bootstrapStr.includes(from)) return bootstrapStr;

  if (replaceAll) {
    return bootstrapStr.split(from).join(to);
  }

  const occurrence = options?.occurrence ?? 1;
  let idx = -1;
  let start = 0;
  for (let k = 0; k < occurrence; k++) {
    idx = bootstrapStr.indexOf(from, start);
    if (idx < 0) return bootstrapStr;
    start = idx + from.length;
  }
  return bootstrapStr.slice(0, idx) + to + bootstrapStr.slice(idx + from.length);
}

export function applyCanvaPatches(bootstrapStr: string, patches: { from: string; to: string }[]): string {
  let out = bootstrapStr;
  const sorted = [...patches].sort((a, b) => b.from.length - a.from.length);
  for (const { from, to } of sorted) {
    out = replaceCanvaInBootstrap(out, from, to);
  }
  return out;
}
