import { apiClient, unwrapData, type ApiEnvelope } from '@/lib/api-client';
import type { User } from '@/types/domain';

export type AuthPayload = {
  user: User;
  csrfToken?: string | null;
};

export async function loginRequest(input: { email: string; password: string }): Promise<AuthPayload> {
  const response = await apiClient.post<ApiEnvelope<AuthPayload>>('/api/auth/login', input);
  return unwrapData(response);
}

export async function getCurrentUserRequest(): Promise<AuthPayload> {
  const response = await apiClient.get<ApiEnvelope<AuthPayload>>('/api/auth/me');
  return unwrapData(response);
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}
