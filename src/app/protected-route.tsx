import { Navigate, Outlet, useLocation } from 'react-router';
import { AppLayout } from '@/app/layouts/app-layout';
import { ErrorState } from '@/components/common/error-state';
import { PageSpinner } from '@/components/ui/spinner';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { ApiError } from '@/lib/api-error';

export function ProtectedRoute() {
  const location = useLocation();
  const currentUser = useCurrentUser();

  if (currentUser.isLoading) {
    return <PageSpinner>Cargando…</PageSpinner>;
  }

  if (currentUser.error instanceof ApiError && currentUser.error.status !== 401) {
    return <ErrorState error={currentUser.error} onRetry={() => void currentUser.refetch()} />;
  }

  if (!currentUser.data) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
