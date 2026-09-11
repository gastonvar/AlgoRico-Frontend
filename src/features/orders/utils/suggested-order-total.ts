export function suggestedOrderTotal(
  items: Array<{ quantity: number; unitPrice: number }>,
): number {
  return items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);
}
