import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { ApiError } from '@/lib/api-error';
import { useAuthStore } from '@/lib/auth-store';
import { readCsrfCookie } from '@/lib/cookies';
import { queryClient } from '@/lib/query-client';
import { CSRF_HEADER_NAME } from '@/types/domain';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

function resolveCsrfToken(): string | undefined {
  return useAuthStore.getState().csrfToken ?? readCsrfCookie();
}

function isFormData(data: unknown): data is FormData {
  return typeof FormData !== 'undefined' && data instanceof FormData;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? 'get').toUpperCase();

  if (!SAFE_METHODS.has(method)) {
    const csrfToken = resolveCsrfToken();
    if (csrfToken) {
      config.headers.set(CSRF_HEADER_NAME, csrfToken);
    }
  }

  if (isFormData(config.data)) {
    config.headers.delete('Content-Type');
  } else if (!config.headers.get('Content-Type')) {
    config.headers.set('Content-Type', 'application/json');
  }

  return config;
});

function isAuthProbe(config: InternalAxiosRequestConfig | undefined): boolean {
  const url = `${config?.baseURL ?? ''}${config?.url ?? ''}`;
  return url.includes('/api/auth/login') || url.includes('/api/auth/me');
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = ApiError.fromUnknown(error);

    if (apiError.status === 401 && !isAuthProbe(error.config)) {
      useAuthStore.getState().clear();
      queryClient.setQueryData(['current-user'], null);
    }

    return Promise.reject(apiError);
  },
);

export type ApiEnvelope<T> = {
  data: T;
  meta?: unknown;
};

export function unwrapData<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  return response.data.data;
}

export function unwrapList<T>(response: AxiosResponse<{ data: T[]; meta: unknown }>) {
  return {
    data: response.data.data,
    meta: response.data.meta as {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    },
  };
}
