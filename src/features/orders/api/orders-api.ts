import { apiClient, unwrapData, unwrapList, type ApiEnvelope } from '@/lib/api-client';
import type { ListOrdersParams } from '@/types/api';
import type { Order, Paginated } from '@/types/domain';

export type OrderItemInput = {
  description?: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
};

export type CreateOrderInput = {
  status?: string;
  eventDate?: string;
  eventTime?: string;
  description?: string;
  fulfillmentType?: string;
  deliveryAddress?: string;
  deliveryTime?: string;
  notes?: string;
  totalAmount?: number;
  items?: OrderItemInput[];
};

export type UpdateOrderInput = {
  status?: string;
  eventDate?: string | null;
  eventTime?: string | null;
  description?: string | null;
  fulfillmentType?: string;
  deliveryAddress?: string | null;
  deliveryTime?: string | null;
  notes?: string | null;
  totalAmount?: number;
  items?: Array<OrderItemInput & { id?: string }>;
};

export async function listOrders(params: ListOrdersParams): Promise<Paginated<Order>> {
  const response = await apiClient.get('/api/orders', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      status: params.status || undefined,
      paymentStatus: params.paymentStatus || undefined,
      fulfillmentType: params.fulfillmentType || undefined,
      clientId: params.clientId || undefined,
      q: params.q || undefined,
      from: params.from || undefined,
      to: params.to || undefined,
    },
  });
  return unwrapList<Order>(response);
}

export async function getOrder(orderId: string): Promise<Order> {
  const response = await apiClient.get<ApiEnvelope<Order>>(`/api/orders/${orderId}`);
  return unwrapData(response);
}

export async function createOrder(clientId: string, input: CreateOrderInput): Promise<Order> {
  const response = await apiClient.post<ApiEnvelope<Order>>(`/api/clients/${clientId}/orders`, input);
  return unwrapData(response);
}

export async function updateOrder(orderId: string, input: UpdateOrderInput): Promise<Order> {
  const response = await apiClient.patch<ApiEnvelope<Order>>(`/api/orders/${orderId}`, input);
  return unwrapData(response);
}

export async function addOrderItem(orderId: string, input: OrderItemInput): Promise<Order> {
  const response = await apiClient.post<ApiEnvelope<Order>>(`/api/orders/${orderId}/items`, input);
  return unwrapData(response);
}

export async function updateOrderItem(
  orderId: string,
  itemId: string,
  input: Partial<OrderItemInput>,
): Promise<Order> {
  const response = await apiClient.patch<ApiEnvelope<Order>>(`/api/orders/${orderId}/items/${itemId}`, input);
  return unwrapData(response);
}

export async function deleteOrderItem(orderId: string, itemId: string): Promise<Order> {
  const response = await apiClient.delete<ApiEnvelope<Order>>(`/api/orders/${orderId}/items/${itemId}`);
  return unwrapData(response);
}

export async function deleteOrder(orderId: string): Promise<void> {
  await apiClient.delete(`/api/orders/${orderId}`);
}
