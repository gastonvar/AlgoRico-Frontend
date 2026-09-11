import { cn } from '@/lib/utils';

export type SectionNavItem = {
  href: string;
  label: string;
};

type SectionNavProps = {
  items: SectionNavItem[];
  className?: string;
};

export function SectionNav({ items, className }: SectionNavProps) {
  return (
    <nav
      aria-label="Secciones de la página"
      className={cn(
        'sticky top-[3.25rem] z-20 -mx-3 border-y bg-background/95 px-3 py-2 backdrop-blur sm:-mx-4 lg:top-[3.75rem] lg:-mx-0 lg:rounded-xl lg:border lg:px-3',
        className,
      )}
    >
      <ul className="flex gap-1.5 overflow-x-auto pb-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="inline-flex h-9 items-center rounded-full border bg-card px-3 text-sm font-medium whitespace-nowrap hover:bg-accent"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
