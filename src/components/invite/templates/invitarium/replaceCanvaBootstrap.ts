/** Экранирование текста для поиска в Canva bootstrap JSON (внутри __bs). */
export function escapeCanvaFragment(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n');
}

/** Замена текстового блока Canva в строке bootstrap. */
export function replaceCanvaInBootstrap(bootstrapStr: string, oldText: string, newText: string): string {
  if (!oldText || oldText === newText) return bootstrapStr;
  const from = `"A":"${escapeCanvaFragment(oldText)}\\\\n"`;
  const to = `"A":"${escapeCanvaFragment(newText)}\\\\n"`;
  return bootstrapStr.includes(from) ? bootstrapStr.split(from).join(to) : bootstrapStr;
}

export function applyCanvaPatches(bootstrapStr: string, patches: { from: string; to: string }[]): string {
  let out = bootstrapStr;
  const sorted = [...patches].sort((a, b) => b.from.length - a.from.length);
  for (const { from, to } of sorted) {
    out = replaceCanvaInBootstrap(out, from, to);
  }
  return out;
}
