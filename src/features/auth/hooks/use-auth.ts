import { useMutation, useQuery } from '@tanstack/react-query';
import { getCurrentUserRequest, loginRequest, logoutRequest } from '@/features/auth/api/auth-api';
import { useAuthStore } from '@/lib/auth-store';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const payload = await getCurrentUserRequest();
      useAuthStore.getState().setSession({ user: payload.user, csrfToken: payload.csrfToken });
      return payload.user;
    },
    retry: false,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (payload) => {
      useAuthStore.getState().setSession({ user: payload.user, csrfToken: payload.csrfToken });
      queryClient.setQueryData(queryKeys.currentUser, payload.user);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      useAuthStore.getState().clear();
      queryClient.clear();
    },
  });
}
