import { create } from 'zustand';
import type { User } from '@/types/domain';

type AuthState = {
  user: User | null;
  csrfToken: string | null;
  status: 'unknown' | 'authenticated' | 'anonymous';
  setSession: (input: { user: User; csrfToken?: string | null }) => void;
  setCsrfToken: (token: string | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  csrfToken: null,
  status: 'unknown',
  setSession: ({ user, csrfToken }) =>
    set({
      user,
      csrfToken: csrfToken ?? null,
      status: 'authenticated',
    }),
  setCsrfToken: (csrfToken) => set({ csrfToken }),
  clear: () =>
    set({
      user: null,
      csrfToken: null,
      status: 'anonymous',
    }),
}));
