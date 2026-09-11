import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/money';

type MoneyDisplayProps = {
  amount: number;
  emphasize?: boolean;
  className?: string;
};

export function MoneyDisplay({ amount, emphasize = false, className }: MoneyDisplayProps) {
  return (
    <span className={cn('tabular-nums', emphasize && 'text-lg font-semibold text-primary', className)}>
      {formatMoney(amount)}
    </span>
  );
}
