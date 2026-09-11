import { apiClient, unwrapData, type ApiEnvelope } from '@/lib/api-client';
import type { CalendarEvent } from '@/types/domain';

export async function getCalendar(from: string, to: string): Promise<CalendarEvent[]> {
  const response = await apiClient.get<ApiEnvelope<CalendarEvent[]>>('/api/calendar', {
    params: { from, to },
  });
  return unwrapData(response);
}
