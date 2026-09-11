import { suggestedOrderTotal } from '@/features/orders/utils/suggested-order-total';

describe('suggestedOrderTotal', () => {
  it('sums quantity times unit price', () => {
    expect(
      suggestedOrderTotal([
        { quantity: 1, unitPrice: 2500 },
        { quantity: 2, unitPrice: 1800 },
      ]),
    ).toBe(6100);
  });
});
