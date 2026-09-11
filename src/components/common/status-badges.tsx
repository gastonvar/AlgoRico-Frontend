import { Badge } from '@/components/ui/badge';
import type { FulfillmentType, OrderStatus, PaymentStatus, TaskPriority } from '@/types/domain';
import { fulfillmentLabels, orderStatusLabels, paymentStatusLabels, taskPriorityLabels } from '@/utils/labels';

const orderStatusVariants: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  LEAD: 'secondary',
  QUOTED: 'secondary',
  AWAITING_DEPOSIT: 'warning',
  CONFIRMED: 'default',
  IN_PRODUCTION: 'default',
  READY: 'success',
  DELIVERED: 'success',
  PICKED_UP: 'success',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const typed = status as OrderStatus;
  return <Badge variant={orderStatusVariants[typed] ?? 'secondary'}>{orderStatusLabels[typed] ?? status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus | string }) {
  const typed = status as PaymentStatus;
  const variant = typed === 'PAID' ? 'success' : typed === 'PARTIALLY_PAID' ? 'warning' : 'destructive';
  return <Badge variant={variant}>{paymentStatusLabels[typed] ?? status}</Badge>;
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority | string }) {
  const typed = priority as TaskPriority;
  const variant = typed === 'HIGH' ? 'destructive' : typed === 'MEDIUM' ? 'warning' : 'secondary';
  return <Badge variant={variant}>{taskPriorityLabels[typed] ?? priority}</Badge>;
}

export function FulfillmentBadge({ type }: { type: FulfillmentType | string }) {
  const typed = type as FulfillmentType;
  return <Badge variant="outline">{fulfillmentLabels[typed] ?? type}</Badge>;
}
