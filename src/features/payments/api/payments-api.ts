import { apiClient, unwrapData, type ApiEnvelope } from '@/lib/api-client';
import type { Order, Payment } from '@/types/domain';

export type CreatePaymentInput = {
  type: string;
  amount: number;
  paymentMethod: string;
  paidAt?: string;
  notes?: string;
  hasPaymentReceipt?: boolean;
};

export type UpdatePaymentInput = {
  type?: string;
  amount?: number;
  paymentMethod?: string;
  paidAt?: string;
  notes?: string | null;
  hasPaymentReceipt?: boolean;
};

export async function listPayments(orderId: string): Promise<Payment[]> {
  const response = await apiClient.get<ApiEnvelope<Payment[]>>(`/api/orders/${orderId}/payments`);
  return unwrapData(response);
}

export async function createPayment(orderId: string, input: CreatePaymentInput): Promise<Order> {
  const response = await apiClient.post<ApiEnvelope<Order>>(`/api/orders/${orderId}/payments`, input);
  return unwrapData(response);
}

export async function updatePayment(paymentId: string, input: UpdatePaymentInput): Promise<Order> {
  const response = await apiClient.patch<ApiEnvelope<Order>>(`/api/payments/${paymentId}`, input);
  return unwrapData(response);
}

export async function deletePayment(paymentId: string): Promise<Order> {
  const response = await apiClient.delete<ApiEnvelope<Order>>(`/api/payments/${paymentId}`);
  return unwrapData(response);
}

export async function getPayment(paymentId: string): Promise<Payment> {
  const response = await apiClient.get<ApiEnvelope<Payment>>(`/api/payments/${paymentId}`);
  return unwrapData(response);
}
