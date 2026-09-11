import { QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { useAuthStore } from '@/lib/auth-store';
import { queryClient } from '@/lib/query-client';
import { setAuthenticated } from '@/testing/msw/db';

export function renderApp(ui: ReactElement, options?: { route?: string } & Omit<RenderOptions, 'wrapper'>) {
  const route = options?.route ?? '/';

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export function authenticateTestUser() {
  setAuthenticated(true);
  useAuthStore.getState().setSession({
    user: {
      id: 'user-1',
      email: 'owner@algorico.local',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    csrfToken: 'test-csrf',
  });
}
