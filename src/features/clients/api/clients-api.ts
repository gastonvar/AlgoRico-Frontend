import { apiClient, unwrapData, unwrapList, type ApiEnvelope } from '@/lib/api-client';
import type { ListClientsParams } from '@/types/api';
import type { Client, ClientDetail, Paginated } from '@/types/domain';

export type CreateClientInput = {
  name: string;
  phone?: string;
  instagramUsername?: string;
  email?: string;
  notes?: string;
  needsFollowUp?: boolean;
};

export type UpdateClientInput = {
  name?: string;
  phone?: string | null;
  instagramUsername?: string | null;
  email?: string | null;
  notes?: string | null;
  needsFollowUp?: boolean;
  archived?: boolean;
};

export async function listClients(params: ListClientsParams): Promise<Paginated<Client>> {
  const response = await apiClient.get('/api/clients', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      q: params.q || undefined,
      needsFollowUp: params.needsFollowUp === undefined ? undefined : String(params.needsFollowUp),
      includeArchived: params.includeArchived ? 'true' : undefined,
    },
  });
  return unwrapList<Client>(response);
}

export async function getClient(clientId: string): Promise<ClientDetail> {
  const response = await apiClient.get<ApiEnvelope<ClientDetail>>(`/api/clients/${clientId}`);
  return unwrapData(response);
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const response = await apiClient.post<ApiEnvelope<Client>>('/api/clients', input);
  return unwrapData(response);
}

export async function updateClient(clientId: string, input: UpdateClientInput): Promise<Client> {
  const response = await apiClient.patch<ApiEnvelope<Client>>(`/api/clients/${clientId}`, input);
  return unwrapData(response);
}
