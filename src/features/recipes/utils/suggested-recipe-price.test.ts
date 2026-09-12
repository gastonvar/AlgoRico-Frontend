import { suggestedRecipePrice } from '@/features/recipes/utils/suggested-recipe-price';

describe('suggestedRecipePrice', () => {
  it('sums ingredient quantity times price per unit', () => {
    expect(
      suggestedRecipePrice([
        { quantity: 0.5, pricePerUnit: 100 },
        { quantity: 4, pricePerUnit: 20 },
      ]),
    ).toBe(130);
  });
});
