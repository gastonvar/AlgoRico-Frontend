import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppErrorBoundary } from '@/app/error-boundary';
import { ProtectedRoute } from '@/app/protected-route';
import { NotFoundRoute } from '@/app/routes/not-found-route';
import { PageSpinner } from '@/components/ui/spinner';
import { LoginRoute } from '@/features/auth/routes/login-route';

const DashboardRoute = lazy(() => import('@/features/dashboard/routes/dashboard-route').then((m) => ({ default: m.DashboardRoute })));
const ClientsRoute = lazy(() => import('@/features/clients/routes/clients-route').then((m) => ({ default: m.ClientsRoute })));
const ClientDetailPage = lazy(() => import('@/app/routes/client-detail-page').then((m) => ({ default: m.ClientDetailPage })));
const OrdersRoute = lazy(() => import('@/features/orders/routes/orders-route').then((m) => ({ default: m.OrdersRoute })));
const NewOrderPage = lazy(() => import('@/app/routes/new-order-page').then((m) => ({ default: m.NewOrderPage })));
const OrderDetailPage = lazy(() => import('@/app/routes/order-detail-page').then((m) => ({ default: m.OrderDetailPage })));
const EditOrderPage = lazy(() => import('@/features/orders/routes/edit-order-page').then((m) => ({ default: m.EditOrderPage })));
const CalendarRoute = lazy(() => import('@/features/calendar/routes/calendar-route').then((m) => ({ default: m.CalendarRoute })));
const TasksRoute = lazy(() => import('@/features/tasks/routes/tasks-route').then((m) => ({ default: m.TasksRoute })));

function RouteFallback() {
  return <PageSpinner>Cargando…</PageSpinner>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/clients" element={<ClientsRoute />} />
              <Route path="/clients/:clientId" element={<ClientDetailPage />} />
              <Route path="/orders" element={<OrdersRoute />} />
              <Route path="/orders/new" element={<NewOrderPage />} />
              <Route path="/orders/:orderId/edit" element={<EditOrderPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              <Route path="/calendar" element={<CalendarRoute />} />
              <Route path="/tasks" element={<TasksRoute />} />
              <Route path="*" element={<NotFoundRoute />} />
            </Route>
            <Route path="*" element={<NotFoundRoute />} />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}
