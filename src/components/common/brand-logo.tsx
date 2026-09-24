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
 * Renders the current company's brand mark or wordmark. Only use this after
 * the session is known; the login screen stays unbranded because the tenant
 * is not known yet. Falls back to Algo Rico assets if a company has no logos.
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
