import { useMutation, useQuery } from '@tanstack/react-query';
import {
  deleteAttachment,
  getAttachment,
  uploadInteractionAttachments,
  uploadPaymentAttachments,
} from '@/features/attachments/api/attachments-api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';

export function useAttachment(attachmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attachments.detail(attachmentId ?? ''),
    queryFn: () => getAttachment(attachmentId as string),
    enabled: Boolean(attachmentId),
    staleTime: 4 * 60 * 1000,
  });
}

export function useUploadInteractionAttachments(clientId: string, orderId?: string) {
  return useMutation({
    mutationFn: ({
      interactionId,
      files,
      onProgress,
    }: {
      interactionId: string;
      files: File[];
      onProgress?: (progress: number) => void;
    }) => uploadInteractionAttachments(interactionId, files, onProgress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['client', clientId, 'interactions'] });
      if (orderId) {
        void queryClient.invalidateQueries({ queryKey: ['order', orderId, 'interactions'] });
      }
    },
  });
}

export function useDeleteAttachment(options?: { clientId?: string; orderId?: string }) {
  return useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(attachmentId),
    onSuccess: () => {
      if (options?.clientId) {
        void queryClient.invalidateQueries({ queryKey: ['client', options.clientId, 'interactions'] });
      }
      if (options?.orderId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(options.orderId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.payments(options.orderId) });
        void queryClient.invalidateQueries({ queryKey: ['order', options.orderId, 'interactions'] });
      }
    },
  });
}

export function useUploadPaymentAttachments(orderId: string) {
  return useMutation({
    mutationFn: ({
      paymentId,
      files,
      onProgress,
    }: {
      paymentId: string;
      files: File[];
      onProgress?: (progress: number) => void;
    }) => uploadPaymentAttachments(paymentId, files, onProgress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.payments(orderId) });
    },
  });
}
