import { MoneyDisplay } from '@/components/common/money-display';
import { PageSection } from '@/components/common/page-section';
import type { OrderItem } from '@/types/domain';

type OrderDetailProductsProps = {
  items: OrderItem[];
};

export function OrderDetailProducts({ items }: OrderDetailProductsProps) {
  const countLabel = items.length === 1 ? '1 producto' : `${items.length} productos`;

  return (
    <PageSection id="productos" title="Productos" description={countLabel}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Este pedido no tiene productos.</p>
      ) : (
        <ul className="-mt-1 divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium">{item.description}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}
                  {item.unitPrice > 0 ? (
                    <>
                      {' '}
                      · <MoneyDisplay amount={item.unitPrice} /> c/u
                    </>
                  ) : null}
                </p>
                {item.notes ? <p className="mt-0.5 break-words text-sm text-muted-foreground">{item.notes}</p> : null}
              </div>
              {item.lineTotal > 0 ? (
                <MoneyDisplay amount={item.lineTotal} className="shrink-0 font-medium" />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </PageSection>
  );
}
