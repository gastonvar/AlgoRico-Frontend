import { useQuery } from '@tanstack/react-query';
import { getCalendar } from '@/features/calendar/api/calendar-api';
import { queryKeys } from '@/lib/query-keys';

export function useCalendar(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.calendar.range(from, to),
    queryFn: () => getCalendar(from, to),
    enabled: enabled && Boolean(from && to),
    staleTime: 60_000,
  });
}
