const formatter = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number): string {
  return formatter.format(amount);
}
