import { cn } from '@/lib/utils';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase() || '?';
}

type ClientAvatarProps = {
  name: string;
  className?: string;
};

export function ClientAvatar({ name, className }: ClientAvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary',
        className,
      )}
      aria-hidden="true"
    >
      {initialsFromName(name)}
    </span>
  );
}
