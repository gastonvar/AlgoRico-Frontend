import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';

const DEFAULT_BRAND = {
  name: 'Algo Rico',
  mark: '/images/logo.png',
  wordmark: '/images/logoandalgorico.png',
} as const;

type BrandLogoProps = {
  variant?: 'mark' | 'wordmark';
  className?: string;
  decorative?: boolean;
};

/**
 * Renders the current company's brand mark or wordmark. Before a company is
 * known (e.g. the login screen, before authentication resolves) it falls
 * back to the default Algo Rico platform branding.
 */
export function BrandLogo({ variant = 'mark', className, decorative = false }: BrandLogoProps) {
  const company = useAuthStore((state) => state.user?.company);

  const name = company?.name ?? DEFAULT_BRAND.name;
  const src =
    (variant === 'wordmark' ? company?.logoWordmarkUrl : company?.logoMarkUrl) ??
    DEFAULT_BRAND[variant];

  return (
    <img
      src={src}
      alt={decorative ? '' : name}
      className={cn('select-none object-contain', className)}
      draggable={false}
    />
  );
}
