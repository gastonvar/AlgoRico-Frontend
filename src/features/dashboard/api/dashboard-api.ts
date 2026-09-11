import { apiClient, unwrapData, type ApiEnvelope } from '@/lib/api-client';
import type { Dashboard } from '@/types/domain';

export async function getDashboard(): Promise<Dashboard> {
  const response = await apiClient.get<ApiEnvelope<Dashboard>>('/api/dashboard');
  return unwrapData(response);
}
