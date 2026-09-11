import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, 'dd/MM/yyyy', { locale: es });
}

export function formatTime(value: string | Date): string {
  if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, 'HH:mm');
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return `${format(date, 'dd/MM/yyyy', { locale: es })} · ${format(date, 'HH:mm')}`;
}

export function formatEventDate(dateOnly: string, time?: string | null): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (!year || !month || !day) {
    return dateOnly;
  }
  const date = new Date(year, month - 1, day);
  const dateLabel = format(date, 'd MMMM yyyy', { locale: es });
  if (!time) {
    return dateLabel;
  }
  return `${dateLabel} · ${time.slice(0, 5)}`;
}

export function formatEventDateShort(dateOnly: string, time?: string | null): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (!year || !month || !day) {
    return dateOnly;
  }
  const date = new Date(year, month - 1, day);
  const dateLabel = format(date, 'dd/MM/yyyy', { locale: es });
  if (!time) {
    return dateLabel;
  }
  return `${dateLabel} · ${time.slice(0, 5)}`;
}

export function formatRelativeDay(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (isToday(date)) {
    return `Hoy · ${format(date, 'HH:mm')}`;
  }
  if (isYesterday(date)) {
    return `Ayer · ${format(date, 'HH:mm')}`;
  }
  return formatDateTime(date);
}

export function formatDateOnlyLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toDateTimeLocalValue(value?: string | Date | null): string {
  const date = value ? (typeof value === 'string' ? parseISO(value) : value) : new Date();
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function fromDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  return date.toISOString();
}

export function isDateOnlyInPast(dateOnly: string): boolean {
  return dateOnly < formatDateOnlyLocal(new Date());
}

export function startOfMonthDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonthDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeekDate(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
}

export function endOfWeekDate(date: Date): Date {
  return addDays(startOfWeekDate(date), 6);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function eachDayOfMonthGrid(cursor: Date): Date[] {
  const start = startOfWeekDate(startOfMonthDate(cursor));
  const end = endOfWeekDate(endOfMonthDate(cursor));
  const days: Date[] = [];
  for (let date = start; date <= end; date = addDays(date, 1)) {
    days.push(date);
  }
  return days;
}
