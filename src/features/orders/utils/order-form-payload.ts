import type { CreateOrderInput, OrderItemInput, UpdateOrderInput } from '@/features/orders/api/orders-api';
import type { OrderFormValues } from '@/features/orders/schemas/order-schemas';

function optionalDate(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function mapItems(items: OrderFormValues['items']): OrderItemInput[] {
  return items.map((item) => ({
    recipeId: item.recipeId,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice) || 0,
    notes: item.notes || undefined,
  }));
}

export function toCreateOrderInput(values: OrderFormValues): CreateOrderInput {
  const isDelivery = values.fulfillmentType === 'DELIVERY';
  return {
    status: values.status,
    eventDate: optionalDate(values.eventDate),
    eventTime: optionalDate(values.eventTime),
    description: values.description || undefined,
    fulfillmentType: values.fulfillmentType,
    deliveryDate: optionalDate(values.deliveryDate),
    deliveryAddress: isDelivery ? values.deliveryAddress : undefined,
    deliveryTime: isDelivery ? optionalDate(values.deliveryTime) : undefined,
    notes: values.notes || undefined,
    totalAmount: Number(values.totalAmount),
    items: mapItems(values.items),
  };
}

export function toUpdateOrderInput(values: OrderFormValues): UpdateOrderInput {
  const isDelivery = values.fulfillmentType === 'DELIVERY';
  return {
    status: values.status,
    eventDate: optionalDate(values.eventDate) ?? null,
    eventTime: optionalDate(values.eventTime) ?? null,
    description: values.description || null,
    fulfillmentType: values.fulfillmentType,
    deliveryDate: optionalDate(values.deliveryDate) ?? null,
    deliveryAddress: isDelivery ? values.deliveryAddress || null : null,
    deliveryTime: isDelivery ? optionalDate(values.deliveryTime) ?? null : null,
    notes: values.notes || null,
    totalAmount: Number(values.totalAmount),
    items: mapItems(values.items).map((item, index) => ({
      ...item,
      id: values.items[index]?.itemId,
    })),
  };
}
