import { apiClient, unwrapData, unwrapList, type ApiEnvelope } from '@/lib/api-client';
import type { ListTasksParams } from '@/types/api';
import type { Paginated, Task } from '@/types/domain';

export type CreateTaskInput = {
  clientId?: string | null;
  orderId?: string | null;
  title: string;
  description?: string;
  dueAt?: string;
  priority?: string;
};

export type UpdateTaskInput = {
  clientId?: string | null;
  orderId?: string | null;
  title?: string;
  description?: string | null;
  dueAt?: string | null;
  priority?: string;
  completed?: boolean;
};

export async function listTasks(params: ListTasksParams): Promise<Paginated<Task>> {
  const response = await apiClient.get('/api/tasks', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      completed: params.completed === undefined ? undefined : String(params.completed),
      due: params.due,
      clientId: params.clientId || undefined,
      orderId: params.orderId || undefined,
      priority: params.priority || undefined,
    },
  });
  return unwrapList<Task>(response);
}

export async function getTask(taskId: string): Promise<Task> {
  const response = await apiClient.get<ApiEnvelope<Task>>(`/api/tasks/${taskId}`);
  return unwrapData(response);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await apiClient.post<ApiEnvelope<Task>>('/api/tasks', input);
  return unwrapData(response);
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  const response = await apiClient.patch<ApiEnvelope<Task>>(`/api/tasks/${taskId}`, input);
  return unwrapData(response);
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/api/tasks/${taskId}`);
}
