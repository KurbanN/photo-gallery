import { useState } from 'react';
import type { EventGuest, EventGuestInput } from '@/lib/organizer-api';
import { BtnPrimary, BtnSecondary, OrganizerField, inputClass } from '@/components/organizer/organizer-ui';

type Props = {
  guest: EventGuest | null;
  onClose: () => void;
  onSave: (input: EventGuestInput) => Promise<void>;
  saving: boolean;
};

const empty: EventGuestInput = {
  firstName: '',
  lastName: '',
  tableNumber: '',
  seatNumber: '',
  phone: '',
  groupName: '',
  notes: '',
};

export default function GuestFormModal({ guest, onClose, onSave, saving }: Props) {
  const [form, setForm] = useState<EventGuestInput>(
    guest
      ? {
          firstName: guest.firstName,
          lastName: guest.lastName,
          tableNumber: guest.tableNumber,
          seatNumber: guest.seatNumber ?? '',
          phone: guest.phone ?? '',
          groupName: guest.groupName ?? '',
          notes: guest.notes ?? '',
        }
      : empty,
  );
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr('');
    if (!form.firstName.trim()) {
      setErr('Укажите имя');
      return;
    }
    if (!form.tableNumber.trim()) {
      setErr('Укажите стол');
      return;
    }
    try {
      await onSave({
        ...form,
        lastName: form.lastName?.trim() || '',
        seatNumber: form.seatNumber?.trim() || null,
        phone: form.phone?.trim() || null,
        groupName: form.groupName?.trim() || null,
        notes: form.notes?.trim() || null,
      });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto border border-line bg-paper p-5 shadow-lg"
      >
        <h3 className="font-serif text-2xl text-ink">
          {guest ? 'Редактировать гостя' : 'Добавить гостя'}
        </h3>
        <div className="mt-4 space-y-3">
          <OrganizerField label="Имя">
            <input
              className={inputClass}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              autoComplete="given-name"
            />
          </OrganizerField>
          <OrganizerField label="Фамилия">
            <input
              className={inputClass}
              value={form.lastName ?? ''}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              autoComplete="family-name"
            />
          </OrganizerField>
          <div className="grid grid-cols-2 gap-3">
            <OrganizerField label="Стол">
              <input
                className={inputClass}
                value={form.tableNumber}
                onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
              />
            </OrganizerField>
            <OrganizerField label="Место">
              <input
                className={inputClass}
                value={form.seatNumber ?? ''}
                onChange={(e) => setForm({ ...form, seatNumber: e.target.value })}
              />
            </OrganizerField>
          </div>
          <OrganizerField label="Телефон">
            <input
              className={inputClass}
              value={form.phone ?? ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              inputMode="tel"
            />
          </OrganizerField>
          <OrganizerField label="Группа">
            <input
              className={inputClass}
              value={form.groupName ?? ''}
              onChange={(e) => setForm({ ...form, groupName: e.target.value })}
            />
          </OrganizerField>
          <OrganizerField label="Заметки">
            <input
              className={inputClass}
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </OrganizerField>
          {err && <p className="text-sm text-red-700">{err}</p>}
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <BtnPrimary disabled={saving} onClick={() => void submit()}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </BtnPrimary>
          <BtnSecondary disabled={saving} onClick={onClose}>
            Отмена
          </BtnSecondary>
        </div>
      </div>
    </div>
  );
}
