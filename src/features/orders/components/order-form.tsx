import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ItemActions } from '@/components/common/item-actions';
import { SearchInput } from '@/components/common/search-input';
import { orderFormSchema, type OrderFormValues } from '@/features/orders/schemas/order-schemas';
import { suggestedOrderTotal } from '@/features/orders/utils/suggested-order-total';
import type { Client } from '@/types/domain';
import { FULFILLMENT_TYPES, ORDER_STATUSES } from '@/types/domain';
import { formatMoney } from '@/utils/money';
import { fulfillmentLabels, orderStatusLabels } from '@/utils/labels';
import { isDateOnlyInPast } from '@/utils/dates';

type OrderFormProps = {
  defaultClientId?: string;
  clientQuery?: string;
  onClientQueryChange?: (value: string) => void;
  clients?: Client[];
  onSubmit: (values: OrderFormValues) => Promise<void>;
  pending?: boolean;
  lockClient?: boolean;
  clientName?: string;
  initialValues?: Partial<OrderFormValues>;
  submitLabel?: string;
};

const emptyItem = { itemId: undefined, description: '', quantity: 1, unitPrice: 0, notes: '' };

export function OrderForm({
  defaultClientId,
  clientQuery = '',
  onClientQueryChange,
  clients = [],
  onSubmit,
  pending,
  lockClient = false,
  clientName,
  initialValues,
  submitLabel = 'Guardar pedido',
}: OrderFormProps) {
  const [totalManuallyEdited, setTotalManuallyEdited] = useState(Boolean(initialValues?.totalAmount !== undefined));
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema) as Resolver<OrderFormValues>,
    defaultValues: {
      clientId: defaultClientId ?? '',
      eventDate: '',
      eventTime: '',
      status: 'LEAD',
      fulfillmentType: 'PICKUP',
      deliveryAddress: '',
      deliveryTime: '',
      notes: '',
      description: '',
      totalAmount: 0,
      items: [emptyItem],
      ...initialValues,
    },
  });

  const items = useFieldArray({ control: form.control, name: 'items' });
  const fulfillmentType = form.watch('fulfillmentType');
  const eventDate = form.watch('eventDate');
  const watchedItems = form.watch('items');
  const itemsTotal = suggestedOrderTotal(watchedItems);

  useEffect(() => {
    if (!totalManuallyEdited) {
      form.setValue('totalAmount', itemsTotal);
    }
  }, [form, itemsTotal, totalManuallyEdited]);

  return (
    <form className="space-y-4 lg:space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <section className="space-y-4 rounded-xl border bg-card p-4 lg:p-5">
        <div>
          <h2 className="text-base font-semibold lg:text-lg">Cliente y fecha</h2>
          <p className="mt-1 text-sm text-muted-foreground">Quién pide y cuándo es el evento.</p>
        </div>
        {lockClient ? (
          <Field>
            <Label>Cliente</Label>
            <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">{clientName ?? 'Cliente'}</p>
          </Field>
        ) : (
          <Field>
            <Label>Cliente</Label>
            <SearchInput
              placeholder="Buscar cliente..."
              value={clientQuery}
              onChange={(event) => onClientQueryChange?.(event.target.value)}
            />
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border">
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  className={`flex min-h-11 w-full items-center px-3 py-2 text-left text-sm hover:bg-accent ${form.watch('clientId') === client.id ? 'bg-primary/10' : ''}`}
                  onClick={() => form.setValue('clientId', client.id, { shouldValidate: true })}
                >
                  {client.name}
                </button>
              ))}
            </div>
            <FieldError>{form.formState.errors.clientId?.message}</FieldError>
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="eventDate">Fecha del evento</Label>
            <Input id="eventDate" type="date" {...form.register('eventDate')} />
            <FieldError>{form.formState.errors.eventDate?.message}</FieldError>
            {eventDate && isDateOnlyInPast(eventDate) ? (
              <p className="text-sm text-warning-foreground">Esta fecha ya pasó. Podés guardarla igual si es un pedido viejo.</p>
            ) : null}
          </Field>
          <Field>
            <Label htmlFor="eventTime">Hora</Label>
            <Input id="eventTime" type="time" {...form.register('eventTime')} />
          </Field>
        </div>
        <Field>
          <Label htmlFor="description">Resumen</Label>
          <Input id="description" placeholder="Torta de cumpleaños" {...form.register('description')} />
        </Field>
        <Field>
          <Label>Estado</Label>
          <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as OrderFormValues['status'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(lockClient ? ORDER_STATUSES : ORDER_STATUSES.filter((status) => status !== 'COMPLETED' && status !== 'CANCELLED')).map((status) => (
                <SelectItem key={status} value={status}>
                  {orderStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4 lg:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold lg:text-lg">Productos</h2>
            <p className="mt-1 text-sm text-muted-foreground">Qué hay que hacer y el precio.</p>
          </div>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => items.append(emptyItem)}>
            Agregar producto
          </Button>
        </div>
        {items.fields.map((field, index) => (
          <div key={field.id} className="space-y-3 rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <Field className="min-w-0 flex-1">
                <Label htmlFor={`item-product-${index}`}>Producto</Label>
                <Input id={`item-product-${index}`} placeholder="Torta, tarta, cookies…" {...form.register(`items.${index}.description`)} />
                <FieldError>{form.formState.errors.items?.[index]?.description?.message}</FieldError>
              </Field>
              {items.fields.length > 1 ? (
                <ItemActions deleteLabel="Quitar producto" onDelete={() => items.remove(index)} />
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <Label htmlFor={`item-qty-${index}`}>Cantidad</Label>
                <Input id={`item-qty-${index}`} type="number" min={1} {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                <FieldError>{form.formState.errors.items?.[index]?.quantity?.message}</FieldError>
              </Field>
              <Field>
                <Label htmlFor={`item-price-${index}`}>Precio unitario</Label>
                <Input
                  id={`item-price-${index}`}
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />
                <FieldError>{form.formState.errors.items?.[index]?.unitPrice?.message}</FieldError>
              </Field>
            </div>
          </div>
        ))}
        <Field>
          <Label htmlFor="totalAmount">Precio final</Label>
          <Input
            id="totalAmount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            {...form.register('totalAmount', {
              valueAsNumber: true,
              onChange: () => setTotalManuallyEdited(true),
            })}
          />
          <p className="text-sm text-muted-foreground">
            Arranca como cantidad × precio ({formatMoney(itemsTotal)}). Lo podés editar.
          </p>
          <FieldError>{form.formState.errors.totalAmount?.message}</FieldError>
        </Field>
        <FieldError>{form.formState.errors.items?.message}</FieldError>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4 lg:p-5">
        <div>
          <h2 className="text-base font-semibold lg:text-lg">Entrega</h2>
          <p className="mt-1 text-sm text-muted-foreground">Retiro o envío, y notas extras.</p>
        </div>
        <Field>
          <Label htmlFor="fulfillmentType">Tipo</Label>
          <NativeSelect id="fulfillmentType" {...form.register('fulfillmentType')}>
            {FULFILLMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {fulfillmentLabels[type]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        {fulfillmentType === 'DELIVERY' ? (
          <>
            <Field>
              <Label htmlFor="deliveryAddress">Dirección</Label>
              <Textarea id="deliveryAddress" {...form.register('deliveryAddress')} />
              <FieldError>{form.formState.errors.deliveryAddress?.message}</FieldError>
            </Field>
            <Field>
              <Label htmlFor="deliveryTime">Hora de entrega</Label>
              <Input id="deliveryTime" type="time" {...form.register('deliveryTime')} />
            </Field>
          </>
        ) : null}
        <Field>
          <Label htmlFor="order-notes">Notas del pedido</Label>
          <Textarea id="order-notes" {...form.register('notes')} />
        </Field>
      </section>

      <FieldError>{form.formState.errors.root?.message}</FieldError>
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-3 border-t bg-background/95 p-3 backdrop-blur sm:-mx-4 lg:static lg:z-auto lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <Button type="submit" className="w-full lg:w-auto" disabled={pending || form.formState.isSubmitting}>
          {pending || form.formState.isSubmitting ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
