import { apiClient, unwrapData, type ApiEnvelope } from '@/lib/api-client';
import type { Attachment, AttachmentDownload } from '@/types/domain';

export async function uploadInteractionAttachments(
  interactionId: string,
  files: File[],
  onProgress?: (progress: number) => void,
): Promise<Attachment[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const response = await apiClient.post<ApiEnvelope<Attachment[]>>(
    `/api/interactions/${interactionId}/attachments`,
    formData,
    {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) {
          return;
        }
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return unwrapData(response);
}

export async function uploadPaymentAttachments(
  paymentId: string,
  files: File[],
  onProgress?: (progress: number) => void,
): Promise<Attachment[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const response = await apiClient.post<ApiEnvelope<Attachment[]>>(
    `/api/payments/${paymentId}/attachments`,
    formData,
    {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) {
          return;
        }
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return unwrapData(response);
}

export async function getAttachment(attachmentId: string): Promise<AttachmentDownload> {
  const response = await apiClient.get<ApiEnvelope<AttachmentDownload>>(`/api/attachments/${attachmentId}`);
  return unwrapData(response);
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await apiClient.delete(`/api/attachments/${attachmentId}`);
}
