import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createInteraction,
  createOrderInteraction,
  deleteInteraction,
  listInteractions,
  listOrderInteractions,
  updateInteraction,
  type CreateInteractionInput,
  type UpdateInteractionInput,
} from '@/features/interactions/api/interactions-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { ListInteractionsParams } from '@/types/api';

export function useInteractions(clientId: string | undefined, params: ListInteractionsParams = {}) {
  return useQuery({
    queryKey: queryKeys.interactions.list(clientId ?? '', params),
    queryFn: () => listInteractions(clientId as string, params),
    enabled: Boolean(clientId),
  });
}

export function useOrderInteractions(orderId: string | undefined, params: ListInteractionsParams = {}) {
  return useQuery({
    queryKey: queryKeys.interactions.forOrder(orderId ?? '', params),
    queryFn: () => listOrderInteractions(orderId as string, params),
    enabled: Boolean(orderId),
  });
}

function invalidateInteractionQueries(clientId: string, orderId?: string | null) {
  void queryClient.invalidateQueries({ queryKey: ['client', clientId, 'interactions'] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(clientId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  if (orderId) {
    void queryClient.invalidateQueries({ queryKey: ['order', orderId, 'interactions'] });
  }
}

export function useCreateInteraction(clientId: string, orderId?: string) {
  return useMutation({
    mutationFn: (input: CreateInteractionInput) =>
      orderId ? createOrderInteraction(orderId, input) : createInteraction(clientId, input),
    onSuccess: (interaction) => {
      invalidateInteractionQueries(clientId, orderId ?? interaction.orderId);
    },
  });
}

export function useUpdateInteraction(clientId: string, orderId?: string) {
  return useMutation({
    mutationFn: ({ interactionId, input }: { interactionId: string; input: UpdateInteractionInput }) =>
      updateInteraction(interactionId, input),
    onSuccess: (interaction) => {
      invalidateInteractionQueries(clientId, orderId ?? interaction.orderId);
    },
  });
}

export function useDeleteInteraction(clientId: string, orderId?: string) {
  return useMutation({
    mutationFn: (interactionId: string) => deleteInteraction(interactionId),
    onSuccess: () => {
      invalidateInteractionQueries(clientId, orderId);
    },
  });
}
