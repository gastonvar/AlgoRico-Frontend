import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { useAuthStore } from '@/lib/auth-store';
import { queryClient } from '@/lib/query-client';
import { resetDb } from '@/testing/msw/db';
import { server } from '@/testing/msw/server';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', { writable: true, value: ResizeObserverMock });
Object.defineProperty(globalThis, 'ResizeObserver', { writable: true, value: ResizeObserverMock });

Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', { writable: true, value: () => false });
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', { writable: true, value: () => undefined });
Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', { writable: true, value: () => undefined });
Object.defineProperty(URL, 'createObjectURL', { writable: true, value: () => 'blob:test' });
Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: () => undefined });

beforeAll(() => {
  queryClient.setDefaultOptions({
    queries: { retry: false, staleTime: 0, gcTime: 0 },
    mutations: { retry: false },
  });
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  resetDb();
  useAuthStore.getState().clear();
  queryClient.clear();
});

afterAll(() => {
  server.close();
});
