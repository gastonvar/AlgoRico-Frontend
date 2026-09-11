import { Link } from 'react-router';

export function TodayStat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-16 min-w-0 flex-col justify-center rounded-xl border bg-card px-3 py-3 hover:bg-accent/40 sm:min-h-[4.5rem] sm:p-4"
    >
      <p className="truncate text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums sm:mt-1 sm:text-3xl">{value}</p>
    </Link>
  );
}
