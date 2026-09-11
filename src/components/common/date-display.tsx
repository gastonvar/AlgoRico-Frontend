import { formatDate, formatDateTime, formatEventDate, formatRelativeDay, formatTime } from '@/utils/dates';

type DateDisplayProps = {
  value: string;
  mode?: 'date' | 'datetime' | 'relative' | 'event' | 'time';
  time?: string | null;
};

export function DateDisplay({ value, mode = 'date', time }: DateDisplayProps) {
  if (mode === 'datetime') {
    return <time dateTime={value}>{formatDateTime(value)}</time>;
  }
  if (mode === 'relative') {
    return <time dateTime={value}>{formatRelativeDay(value)}</time>;
  }
  if (mode === 'event') {
    return <time dateTime={value}>{formatEventDate(value, time)}</time>;
  }
  if (mode === 'time') {
    return <time dateTime={value}>{formatTime(value)}</time>;
  }
  return <time dateTime={value}>{formatDate(value)}</time>;
}
