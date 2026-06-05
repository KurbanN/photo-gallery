import { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import GuestFormModal from '@/components/seats/admin/GuestFormModal';
import GuestImportPanel from '@/components/seats/admin/GuestImportPanel';
import SeatQrPrintSection from '@/components/seats/admin/SeatQrPrintSection';
import {
  BtnPrimary,
  BtnSecondary,
  OrganizerField,
  OrganizerSection,
  StatusMessage,
  inputClass,
  textareaClass,
} from '@/components/organizer/organizer-ui';
import type { EventSettings } from '@/lib/organizer-api';
import {
  createGuest,
  deleteGuest,
  exportGuestsCsv,
  fetchGuestStats,
  fetchGuestTables,
  importGuests,
  listGuests,
  updateEvent,
  updateGuest,
  type EventGuest,
  type EventGuestInput,
} from '@/lib/organizer-api';

type Props = {
  eventId: string;
  slug: string;
  eventTitle: string;
  welcomeTitle: string;
  settings: EventSettings;
  onSettingsSaved: () => void;
};

export default function SeatsManagePanel({
  eventId,
  slug,
  eventTitle,
  welcomeTitle,
  settings,
  onSettingsSaved,
}: Props) {
  const [stats, setStats] = useState({ total: 0, tables: 0 });
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalGuest, setModalGuest] = useState<EventGuest | null | 'new'>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [seatsWelcome, setSeatsWelcome] = useState(settings.seatsWelcomeMessage ?? '');
  const [seatsEnabled, setSeatsEnabled] = useState(settings.seatsEnabled !== false);
  const [showTablemates, setShowTablemates] = useState(settings.seatsShowTablemates !== false);
  const [showSeatNumber, setShowSeatNumber] = useState(settings.seatsShowSeatNumber !== false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, listData, tablesData] = await Promise.all([
        fetchGuestStats(eventId),
        listGuests(eventId, { page, limit: 50, q: q || undefined, table: tableFilter || undefined }),
        fetchGuestTables(eventId),
      ]);
      setStats(statsData);
      setGuests(listData.guests);
      setTotal(listData.total);
      setTables(tablesData);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [eventId, page, q, tableFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveGuest = async (input: EventGuestInput) => {
    setSaving(true);
    try {
      if (modalGuest && modalGuest !== 'new') {
        await updateGuest(eventId, modalGuest.id, input);
      } else {
        await createGuest(eventId, input);
      }
      await load();
    } finally {
      setSaving(false);
    }
  };

  const removeGuest = async (guest: EventGuest) => {
    if (!confirm(`Удалить ${guest.fullName}?`)) return;
    await deleteGuest(eventId, guest.id);
    await load();
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    setMsg('');
    try {
      await updateEvent(eventId, {
        settings: {
          ...settings,
          seatsEnabled,
          seatsWelcomeMessage: seatsWelcome.trim(),
          seatsShowTablemates: showTablemates,
          seatsShowSeatNumber: showSeatNumber,
        },
      });
      setMsg('Настройки рассадки сохранены');
      onSettingsSaved();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSettingsSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="space-y-6">
      <OrganizerSection title="Статистика">
        <p className="font-serif text-2xl text-ink">
          {stats.total} {stats.total === 1 ? 'гость' : stats.total < 5 ? 'гостя' : 'гостей'}
          <span className="ml-3 text-base text-muted">· {stats.tables} столов</span>
        </p>
      </OrganizerSection>

      <OrganizerSection
        title="Список гостей"
        description="Добавьте гостей вручную или импортируйте CSV."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <BtnPrimary onClick={() => setModalGuest('new')}>
            <Plus className="h-3.5 w-3.5" />
            Добавить
          </BtnPrimary>
          <BtnSecondary onClick={() => void exportGuestsCsv(eventId, slug)}>
            <Download className="h-3.5 w-3.5" />
            Экспорт CSV
          </BtnSecondary>
        </div>

        <GuestImportPanel
          onImport={async (rows, mode) => {
            await importGuests(eventId, rows, mode);
            await load();
          }}
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Поиск по имени…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <select
            className={inputClass}
            value={tableFilter}
            onChange={(e) => {
              setTableFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Все столы</option>
            {tables.map((t) => (
              <option key={t} value={t}>
                Стол {t}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : guests.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Гостей пока нет</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[10px] uppercase tracking-[0.15em] text-muted">
                    <th className="py-2 pr-3">Имя</th>
                    <th className="py-2 pr-3">Стол</th>
                    <th className="py-2 pr-3">Место</th>
                    <th className="py-2 pr-3">Группа</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g) => (
                    <tr key={g.id} className="border-b border-line/70">
                      <td className="py-2.5 pr-3">{g.fullName}</td>
                      <td className="py-2.5 pr-3 font-serif">{g.tableNumber}</td>
                      <td className="py-2.5 pr-3 text-muted">{g.seatNumber || '—'}</td>
                      <td className="py-2.5 pr-3 text-muted">{g.groupName || '—'}</td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          className="mr-2 text-muted hover:text-ink"
                          onClick={() => setModalGuest(g)}
                          aria-label="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-muted hover:text-red-800"
                          onClick={() => void removeGuest(g)}
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-2 sm:hidden">
              {guests.map((g) => (
                <li key={g.id} className="border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink">{g.fullName}</p>
                      <p className="mt-1 text-sm text-muted">
                        Стол <span className="font-serif text-ink">{g.tableNumber}</span>
                        {g.seatNumber ? ` · место ${g.seatNumber}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setModalGuest(g)}>
                        <Pencil className="h-4 w-4 text-muted" />
                      </button>
                      <button type="button" onClick={() => void removeGuest(g)}>
                        <Trash2 className="h-4 w-4 text-muted" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <BtnSecondary disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Назад
                </BtnSecondary>
                <span className="text-xs text-muted">
                  {page} / {totalPages}
                </span>
                <BtnSecondary disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Далее
                </BtnSecondary>
              </div>
            )}
          </>
        )}
      </OrganizerSection>

      <OrganizerSection title="QR «Найдите своё место»">
        <SeatQrPrintSection eventId={eventId} slug={slug} welcomeTitle={welcomeTitle || eventTitle} />
      </OrganizerSection>

      <OrganizerSection title="Настройки рассадки">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={seatsEnabled}
            onChange={(e) => setSeatsEnabled(e.target.checked)}
          />
          Рассадка опубликована для гостей
        </label>
        <OrganizerField label="Приветствие на странице поиска">
          <textarea
            className={textareaClass}
            rows={2}
            value={seatsWelcome}
            onChange={(e) => setSeatsWelcome(e.target.value)}
            placeholder="Добро пожаловать! Введите имя, чтобы найти свой стол."
          />
        </OrganizerField>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showTablemates}
            onChange={(e) => setShowTablemates(e.target.checked)}
          />
          Показывать других гостей за тем же столом
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showSeatNumber}
            onChange={(e) => setShowSeatNumber(e.target.checked)}
          />
          Показывать номер места
        </label>
        <BtnSecondary disabled={settingsSaving} onClick={() => void saveSettings()}>
          {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Сохранить настройки
        </BtnSecondary>
      </OrganizerSection>

      {msg && (
        <StatusMessage text={msg} error={msg.includes('Ошиб') || msg.includes('ошиб')} />
      )}

      {modalGuest !== null && (
        <GuestFormModal
          guest={modalGuest === 'new' ? null : modalGuest}
          onClose={() => setModalGuest(null)}
          onSave={saveGuest}
          saving={saving}
        />
      )}
    </div>
  );
}
