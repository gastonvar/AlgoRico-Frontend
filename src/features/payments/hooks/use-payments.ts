import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createPayment,
  deletePayment,
  listPayments,
  updatePayment,
  type CreatePaymentInput,
  type UpdatePaymentInput,
} from '@/features/payments/api/payments-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';

function invalidatePaymentQueries(orderId: string, clientId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.payments(orderId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  void queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
  if (clientId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(clientId) });
  }
}

export function usePayments(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.payments(orderId ?? ''),
    queryFn: () => listPayments(orderId as string),
    enabled: Boolean(orderId),
  });
}

export function useCreatePayment(orderId: string) {
  return useMutation({
    mutationFn: (input: CreatePaymentInput) => createPayment(orderId, input),
    onSuccess: (order) => {
      invalidatePaymentQueries(orderId, order.clientId);
    },
  });
}

export function useUpdatePayment(orderId: string) {
  return useMutation({
    mutationFn: ({ paymentId, input }: { paymentId: string; input: UpdatePaymentInput }) =>
      updatePayment(paymentId, input),
    onSuccess: (order) => {
      invalidatePaymentQueries(orderId, order.clientId);
    },
  });
}

export function useDeletePayment(orderId: string) {
  return useMutation({
    mutationFn: (paymentId: string) => deletePayment(paymentId),
    onSuccess: (order) => {
      invalidatePaymentQueries(orderId, order.clientId);
    },
  });
}
