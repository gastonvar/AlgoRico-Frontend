export function suggestedRecipePrice(
  lines: Array<{ quantity: number; pricePerUnit: number }>,
): number {
  return lines.reduce((sum, line) => {
    const quantity = Number(line.quantity) || 0;
    const pricePerUnit = Number(line.pricePerUnit) || 0;
    return sum + quantity * pricePerUnit;
  }, 0);
}
