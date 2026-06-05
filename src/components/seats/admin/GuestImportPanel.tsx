import { useRef, useState } from 'react';
import { Download, Loader2, Upload } from 'lucide-react';
import { BtnPrimary, BtnSecondary, StatusMessage } from '@/components/organizer/organizer-ui';
import { downloadGuestTemplate, parseGuestCsv } from '@/lib/csv-guest-import';
import type { EventGuestInput } from '@/lib/organizer-api';

type Props = {
  onImport: (guests: EventGuestInput[], mode: 'replace' | 'append') => Promise<void>;
};

export default function GuestImportPanel({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<EventGuestInput[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const onFile = async (file: File) => {
    setMsg('');
    const text = await file.text();
    const parsed = parseGuestCsv(text);
    setPreview(parsed.preview);
    setErrors(parsed.errors);
    if (parsed.guests.length === 0) {
      setMsg('Не удалось разобрать файл');
      return;
    }
    (inputRef.current as HTMLInputElement & { _guests?: EventGuestInput[] })._guests = parsed.guests;
  };

  const runImport = async () => {
    const guests = (inputRef.current as HTMLInputElement & { _guests?: EventGuestInput[] })?._guests;
    if (!guests?.length) {
      setMsg('Сначала выберите CSV');
      return;
    }
    if (mode === 'replace' && !confirm('Заменить весь список гостей? Текущие записи будут удалены.')) {
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      await onImport(guests, mode);
      setMsg(`Импортировано ${guests.length} гостей`);
      setPreview([]);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Ошибка импорта');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 border border-line bg-white/50 p-4">
      <p className="text-sm text-muted">
        CSV с колонками firstName, lastName, tableNumber. Поддерживаются заголовки на русском.
      </p>
      <div className="flex flex-wrap gap-2">
        <BtnSecondary onClick={downloadGuestTemplate}>
          <Download className="h-3.5 w-3.5" />
          Шаблон CSV
        </BtnSecondary>
        <BtnSecondary onClick={() => inputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" />
          Выбрать файл
        </BtnSecondary>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = '';
          }}
        />
      </div>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === 'append'}
            onChange={() => setMode('append')}
          />
          Добавить к списку
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === 'replace'}
            onChange={() => setMode('replace')}
          />
          Заменить весь список
        </label>
      </div>
      {preview.length > 0 && (
        <div className="overflow-x-auto">
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted">
            Превью ({preview.length} из файла)
          </p>
          <table className="w-full min-w-[320px] text-left text-xs">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-1 pr-2">Имя</th>
                <th className="py-1 pr-2">Стол</th>
                <th className="py-1">Место</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((g, i) => (
                <tr key={i} className="border-b border-line/60">
                  <td className="py-1.5 pr-2">
                    {g.firstName} {g.lastName}
                  </td>
                  <td className="py-1.5 pr-2">{g.tableNumber}</td>
                  <td className="py-1.5">{g.seatNumber || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {errors.length > 0 && (
        <ul className="text-xs text-amber-800">
          {errors.slice(0, 5).map((e, i) => (
            <li key={i}>{e}</li>
          ))}
          {errors.length > 5 && <li>…и ещё {errors.length - 5}</li>}
        </ul>
      )}
      <BtnPrimary disabled={busy || preview.length === 0} onClick={() => void runImport()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Импортировать
      </BtnPrimary>
      {msg && <StatusMessage text={msg} error={msg.includes('Ошиб') || msg.includes('Не удал')} />}
    </div>
  );
}
