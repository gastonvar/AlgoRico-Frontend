import type {
  FulfillmentType,
  IngredientUnit,
  InteractionChannel,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  TaskPriority,
} from '@/types/domain';

export const interactionChannelLabels: Record<InteractionChannel, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  PHONE: 'Teléfono',
  IN_PERSON: 'En persona',
  OTHER: 'Otro',
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  LEAD: 'Consulta',
  QUOTED: 'Presupuestado',
  AWAITING_DEPOSIT: 'Esperando seña',
  CONFIRMED: 'Confirmado',
  IN_PRODUCTION: 'En producción',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  PICKED_UP: 'Retirado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export const fulfillmentLabels: Record<FulfillmentType, string> = {
  PICKUP: 'Retiro',
  DELIVERY: 'Entrega',
};

export const paymentTypeLabels: Record<PaymentType, string> = {
  DEPOSIT: 'Seña',
  FINAL: 'Saldo',
  OTHER: 'Otro',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  BANK_TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
  OTHER: 'Otro',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Sin pagar',
  PARTIALLY_PAID: 'Pago parcial',
  PAID: 'Pagado',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
};

export const missingInfoLabels: Record<string, string> = {
  'Missing event date': 'Falta la fecha del evento',
  'Missing event time': 'Falta la hora del evento',
  'Missing delivery address': 'Falta la dirección de entrega',
  'Missing delivery time': 'Falta la hora de entrega',
};

export const ingredientUnitLabels: Record<IngredientUnit, string> = {
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'l',
  un: 'un.',
};

export function labelForMissingIssue(issue: string): string {
  return missingInfoLabels[issue] ?? issue;
}
