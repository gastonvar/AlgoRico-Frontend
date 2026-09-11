import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createClient,
  getClient,
  listClients,
  updateClient,
  type CreateClientInput,
  type UpdateClientInput,
} from '@/features/clients/api/clients-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { ListClientsParams } from '@/types/api';

export function useClients(params: ListClientsParams) {
  return useQuery({
    queryKey: queryKeys.clients.list(params),
    queryFn: () => listClients(params),
  });
}

export function useClient(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clients.detail(clientId ?? ''),
    queryFn: () => getClient(clientId as string),
    enabled: Boolean(clientId),
  });
}

function invalidateClientQueries(clientId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  if (clientId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(clientId) });
  }
}

export function useCreateClient() {
  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient(input),
    onSuccess: (client) => {
      invalidateClientQueries(client.id);
    },
  });
}

export function useUpdateClient(clientId: string) {
  return useMutation({
    mutationFn: (input: UpdateClientInput) => updateClient(clientId, input),
    onSuccess: () => {
      invalidateClientQueries(clientId);
    },
  });
}
