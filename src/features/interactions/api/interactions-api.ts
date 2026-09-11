import { apiClient, unwrapData, unwrapList, type ApiEnvelope } from '@/lib/api-client';
import type { ListInteractionsParams } from '@/types/api';
import type { Interaction, InteractionChannel, Paginated } from '@/types/domain';

export type CreateInteractionInput = {
  channel: InteractionChannel;
  content: string;
  occurredAt?: string;
};

export type UpdateInteractionInput = {
  channel?: InteractionChannel;
  content?: string;
  occurredAt?: string;
};

export async function listInteractions(
  clientId: string,
  params: ListInteractionsParams = {},
): Promise<Paginated<Interaction>> {
  const response = await apiClient.get(`/api/clients/${clientId}/interactions`, {
    params: { page: params.page, pageSize: params.pageSize },
  });
  return unwrapList<Interaction>(response);
}

export async function createInteraction(clientId: string, input: CreateInteractionInput): Promise<Interaction> {
  const response = await apiClient.post<ApiEnvelope<Interaction>>(
    `/api/clients/${clientId}/interactions`,
    input,
  );
  return unwrapData(response);
}

export async function listOrderInteractions(
  orderId: string,
  params: ListInteractionsParams = {},
): Promise<Paginated<Interaction>> {
  const response = await apiClient.get(`/api/orders/${orderId}/interactions`, {
    params: { page: params.page, pageSize: params.pageSize },
  });
  return unwrapList<Interaction>(response);
}

export async function createOrderInteraction(
  orderId: string,
  input: CreateInteractionInput,
): Promise<Interaction> {
  const response = await apiClient.post<ApiEnvelope<Interaction>>(
    `/api/orders/${orderId}/interactions`,
    input,
  );
  return unwrapData(response);
}

export async function updateInteraction(
  interactionId: string,
  input: UpdateInteractionInput,
): Promise<Interaction> {
  const response = await apiClient.patch<ApiEnvelope<Interaction>>(`/api/interactions/${interactionId}`, input);
  return unwrapData(response);
}

export async function deleteInteraction(interactionId: string): Promise<void> {
  await apiClient.delete(`/api/interactions/${interactionId}`);
}
