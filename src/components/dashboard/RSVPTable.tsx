import type { RSVPResponse } from '@/lib/invite-api';

const STATUS_LABEL: Record<RSVPResponse['status'], string> = {
  attending: 'Придет',
  maybe: 'Под вопросом',
  declined: 'Не придет',
};

export default function RSVPTable({ rows }: { rows: RSVPResponse[] }) {
  if (!rows.length) {
    return <p className="text-sm text-muted">Пока нет ответов.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-line/70">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-line/20 text-xs uppercase tracking-[0.12em] text-muted">
          <tr>
            <th className="px-3 py-2">Имя</th>
            <th className="px-3 py-2">Статус</th>
            <th className="px-3 py-2">Комментарий</th>
            <th className="px-3 py-2">Время</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-line/40">
              <td className="px-3 py-2">{r.name}</td>
              <td className="px-3 py-2">{STATUS_LABEL[r.status]}</td>
              <td className="px-3 py-2">{r.comment || '-'}</td>
              <td className="px-3 py-2">{new Date(r.created_at).toLocaleString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
