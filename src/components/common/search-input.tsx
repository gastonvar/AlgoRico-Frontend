import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn('pl-9', className)} type="search" enterKeyHint="search" autoComplete="off" {...props} />
    </div>
  );
}
