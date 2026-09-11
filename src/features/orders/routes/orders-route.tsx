import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { DateDisplay } from '@/components/common/date-display';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { MoneyDisplay } from '@/components/common/money-display';
import { PageHeader } from '@/components/common/page-header';
import { PaginationControls } from '@/components/common/pagination-controls';
import { SearchInput } from '@/components/common/search-input';
import { FulfillmentBadge, OrderStatusBadge, PaymentStatusBadge } from '@/components/common/status-badges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { cn } from '@/lib/utils';
import { FULFILLMENT_TYPES, ORDER_STATUSES, PAYMENT_STATUSES } from '@/types/domain';
import { fulfillmentLabels, orderStatusLabels, paymentStatusLabels } from '@/utils/labels';

export function OrdersRoute() {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? '';
  const paymentStatus = params.get('paymentStatus') ?? '';
  const fulfillmentType = params.get('fulfillmentType') ?? '';
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const page = Number(params.get('page') ?? '1');
  const orders = useOrders({
    q,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
    fulfillmentType: fulfillmentType || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    pageSize: 20,
  });

  function update(next: Record<string, string>) {
    const nextParams = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (!value) nextParams.delete(key);
      else nextParams.set(key, value);
    }
    if (!('page' in next)) {
      nextParams.set('page', '1');
    }
    setParams(nextParams);
  }

  return (
    <div className="min-w-0">
      <PageHeader
        title="Pedidos"
        description="Filtrá por fecha, estado, entrega o pago."
        actions={
          <Button asChild>
            <Link to="/orders/new">Nuevo pedido</Link>
          </Button>
        }
      />
      <div className="mb-4 min-w-0 space-y-3">
        <SearchInput placeholder="Buscar cliente..." value={q} onChange={(event) => update({ q: event.target.value })} />
        <div className="min-w-0">
          <button
            type="button"
            className="flex h-11 w-full items-center rounded-lg border border-input bg-card px-3 text-sm font-medium shadow-sm md:hidden"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            Filtros
          </button>
          <div
            className={cn(
              'grid gap-3 md:grid-cols-5',
              filtersOpen ? 'mt-3 md:mt-0' : 'hidden md:grid',
            )}
          >
            <FieldSelect
              label="Estado"
              value={status}
              onChange={(value) => update({ status: value })}
              options={ORDER_STATUSES.map((item) => ({ value: item, label: orderStatusLabels[item] }))}
            />
            <FieldSelect
              label="Pago"
              value={paymentStatus}
              onChange={(value) => update({ paymentStatus: value })}
              options={PAYMENT_STATUSES.map((item) => ({ value: item, label: paymentStatusLabels[item] }))}
            />
            <FieldSelect
              label="Entrega"
              value={fulfillmentType}
              onChange={(value) => update({ fulfillmentType: value })}
              options={FULFILLMENT_TYPES.map((item) => ({ value: item, label: fulfillmentLabels[item] }))}
            />
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="from">Desde</Label>
              <InputDate id="from" value={from} onChange={(value) => update({ from: value })} />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="to">Hasta</Label>
              <InputDate id="to" value={to} onChange={(value) => update({ to: value })} />
            </div>
          </div>
        </div>
      </div>
      {orders.isLoading ? <LoadingSkeleton /> : null}
      {orders.error ? <ErrorState error={orders.error} onRetry={() => void orders.refetch()} /> : null}
      {orders.data && orders.data.data.length === 0 ? (
        <EmptyState
          title="No hay pedidos con esos filtros."
          description="Creá un pedido o cambiá la búsqueda."
          actionLabel="Nuevo pedido"
          onAction={() => navigate('/orders/new')}
        />
      ) : null}
      {orders.data ? (
        <>
          <div className="min-w-0 space-y-2">
            {orders.data.data.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block min-w-0 rounded-xl border bg-card p-4 hover:bg-accent/40"
              >
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-medium">{order.client?.name ?? 'Cliente'}</p>
                    <p className="break-words text-sm text-muted-foreground">{order.description || 'Pedido'}</p>
                    {order.eventDate ? (
                      <p className="text-sm">
                        <DateDisplay value={order.eventDate} mode="event" time={order.eventTime} />
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin fecha</p>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-2">
                    <OrderStatusBadge status={order.status} />
                    <FulfillmentBadge type={order.fulfillmentType} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>
                <div className="mt-2 min-w-0 space-y-0.5 text-sm">
                  <p className="min-w-0">
                    Total <MoneyDisplay amount={order.totalAmount} />
                  </p>
                  <p className="min-w-0">
                    Resta <MoneyDisplay amount={order.remainingBalance} emphasize={order.remainingBalance > 0} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <PaginationControls meta={orders.data.meta} onPageChange={(next) => update({ page: String(next) })} />
        </>
      ) : null}
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label>{label}</Label>
      <Select value={value || 'all'} onValueChange={(next) => onChange(next === 'all' ? '' : next)}>
        <SelectTrigger className="min-w-0 [&>span]:min-w-0 [&>span]:truncate">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function InputDate({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <Input
      id={id}
      type="date"
      className="min-w-0"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
