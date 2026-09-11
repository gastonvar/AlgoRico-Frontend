import { cn } from '@/lib/utils';

const brandAssets = {
  mark: '/images/logo.png',
  wordmark: '/images/logoandalgorico.png',
} as const;

type BrandLogoProps = {
  variant?: keyof typeof brandAssets;
  className?: string;
  decorative?: boolean;
};

export function BrandLogo({ variant = 'mark', className, decorative = false }: BrandLogoProps) {
  return (
    <img
      src={brandAssets[variant]}
      alt={decorative ? '' : 'Algo Rico'}
      className={cn('select-none object-contain', className)}
      draggable={false}
    />
  );
}
