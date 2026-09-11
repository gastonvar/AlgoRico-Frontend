import { useMutation, useQuery } from '@tanstack/react-query';
import {
  addOrderItem,
  createOrder,
  deleteOrder,
  deleteOrderItem,
  getOrder,
  listOrders,
  updateOrder,
  updateOrderItem,
  type CreateOrderInput,
  type OrderItemInput,
  type UpdateOrderInput,
} from '@/features/orders/api/orders-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { ListOrdersParams } from '@/types/api';

export function useOrders(params: ListOrdersParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => listOrders(params),
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId ?? ''),
    queryFn: () => getOrder(orderId as string),
    enabled: Boolean(orderId),
  });
}

function invalidateOrderQueries(order?: { id?: string; clientId?: string }) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
  if (order?.id) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(order.id) });
  }
  if (order?.clientId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(order.clientId) });
  }
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ clientId, input }: { clientId: string; input: CreateOrderInput }) =>
      createOrder(clientId, input),
    onSuccess: (order) => {
      invalidateOrderQueries(order);
    },
  });
}

export function useUpdateOrder(orderId: string) {
  return useMutation({
    mutationFn: (input: UpdateOrderInput) => updateOrder(orderId, input),
    onSuccess: (order) => {
      invalidateOrderQueries(order);
    },
  });
}

export function useAddOrderItem(orderId: string) {
  return useMutation({
    mutationFn: (input: OrderItemInput) => addOrderItem(orderId, input),
    onSuccess: (order) => {
      invalidateOrderQueries(order);
    },
  });
}

export function useUpdateOrderItem(orderId: string) {
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: Partial<OrderItemInput> }) =>
      updateOrderItem(orderId, itemId, input),
    onSuccess: (order) => {
      invalidateOrderQueries(order);
    },
  });
}

export function useDeleteOrderItem(orderId: string) {
  return useMutation({
    mutationFn: (itemId: string) => deleteOrderItem(orderId, itemId),
    onSuccess: (order) => {
      invalidateOrderQueries(order);
    },
  });
}

export function useDeleteOrder(orderId: string, clientId?: string) {
  return useMutation({
    mutationFn: () => deleteOrder(orderId),
    onSuccess: () => {
      invalidateOrderQueries({ id: orderId, clientId });
    },
  });
}
