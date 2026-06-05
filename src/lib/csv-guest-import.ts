import type { EventGuestInput } from './organizer-api';

const COLUMN_ALIASES: Record<keyof EventGuestInput, string[]> = {
  firstName: ['firstname', 'first_name', 'имя', 'name', 'first'],
  lastName: ['lastname', 'last_name', 'фамилия', 'surname', 'last'],
  tableNumber: ['tablenumber', 'table_number', 'стол', 'table', 'table_no'],
  seatNumber: ['seatnumber', 'seat_number', 'место', 'seat'],
  phone: ['phone', 'телефон', 'tel', 'mobile'],
  groupName: ['groupname', 'group_name', 'группа', 'group'],
  notes: ['notes', 'заметки', 'note', 'comment'],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

function mapHeader(header: string): keyof EventGuestInput | null {
  const n = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [keyof EventGuestInput, string[]][]) {
    if (aliases.includes(n) || n === field.toLowerCase()) return field;
  }
  return null;
}

function detectDelimiter(line: string): ',' | ';' {
  const semicolons = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

function parseCsvLine(line: string, delimiter: ',' | ';'): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

export type CsvParseResult = {
  guests: EventGuestInput[];
  errors: string[];
  preview: EventGuestInput[];
};

export function parseGuestCsv(text: string): CsvParseResult {
  const raw = text.replace(/^\uFEFF/, '').trim();
  if (!raw) return { guests: [], errors: ['Файл пуст'], preview: [] };

  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { guests: [], errors: ['Нужна строка заголовков и хотя бы одна строка данных'], preview: [] };

  const delimiter = detectDelimiter(lines[0]!);
  const headers = parseCsvLine(lines[0]!, delimiter);
  const fieldIndexes: Partial<Record<keyof EventGuestInput, number>> = {};
  headers.forEach((h, i) => {
    const field = mapHeader(h);
    if (field) fieldIndexes[field] = i;
  });

  if (fieldIndexes.firstName === undefined || fieldIndexes.tableNumber === undefined) {
    return {
      guests: [],
      errors: ['Не найдены колонки firstName/имя и tableNumber/стол'],
      preview: [],
    };
  }

  const guests: EventGuestInput[] = [];
  const errors: string[] = [];

  for (let row = 1; row < lines.length; row++) {
    const cols = parseCsvLine(lines[row]!, delimiter);
    const get = (field: keyof EventGuestInput) => {
      const idx = fieldIndexes[field];
      return idx !== undefined ? (cols[idx] ?? '').trim() : '';
    };
    const firstName = get('firstName');
    const tableNumber = get('tableNumber');
    if (!firstName && !tableNumber) continue;
    if (!firstName) {
      errors.push(`Строка ${row + 1}: нет имени`);
      continue;
    }
    if (!tableNumber) {
      errors.push(`Строка ${row + 1}: нет стола`);
      continue;
    }
    guests.push({
      firstName,
      lastName: get('lastName') || '',
      tableNumber,
      seatNumber: get('seatNumber') || null,
      phone: get('phone') || null,
      groupName: get('groupName') || null,
      notes: get('notes') || null,
    });
  }

  return { guests, errors, preview: guests.slice(0, 10) };
}

export const GUEST_CSV_TEMPLATE = `firstName,lastName,tableNumber,seatNumber,phone,groupName,notes
Анна,Иванова,7,3,,Семья невесты,
Пётр,Сидоров,12,,,Друзья жениха,
`;

export function downloadGuestTemplate(): void {
  const blob = new Blob(['\uFEFF' + GUEST_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'guest-list-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}
