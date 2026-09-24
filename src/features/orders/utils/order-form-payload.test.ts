import { toCreateOrderInput } from '@/features/orders/utils/order-form-payload';
import type { OrderFormValues } from '@/features/orders/schemas/order-schemas';

const baseValues: OrderFormValues = {
  clientId: 'client-1',
  eventDate: '',
  eventTime: '',
  status: 'LEAD',
  fulfillmentType: 'PICKUP',
  deliveryDate: '',
  deliveryAddress: '',
  deliveryTime: '',
  notes: '',
  description: '',
  totalAmount: 15000,
  items: [],
};

describe('toCreateOrderInput', () => {
  it('omits empty dates and recipes while keeping the final price', () => {
    expect(toCreateOrderInput(baseValues)).toEqual({
      status: 'LEAD',
      eventDate: undefined,
      eventTime: undefined,
      description: undefined,
      fulfillmentType: 'PICKUP',
      deliveryDate: undefined,
      deliveryAddress: undefined,
      deliveryTime: undefined,
      notes: undefined,
      totalAmount: 15000,
      items: [],
    });
  });

  it('keeps delivery fields for Enviar orders', () => {
    expect(
      toCreateOrderInput({
        ...baseValues,
        fulfillmentType: 'DELIVERY',
        deliveryDate: '2026-09-26',
        deliveryAddress: 'Calle 123',
        deliveryTime: '11:00',
      }),
    ).toMatchObject({
      fulfillmentType: 'DELIVERY',
      deliveryDate: '2026-09-26',
      deliveryAddress: 'Calle 123',
      deliveryTime: '11:00',
      totalAmount: 15000,
    });
  });
});
