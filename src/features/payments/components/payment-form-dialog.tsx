import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePayment, useUpdatePayment } from '@/features/payments/hooks/use-payments';
import { paymentFormSchema, type PaymentFormValues } from '@/features/payments/schemas/payment-schemas';
import { applyFieldErrors } from '@/lib/form-errors';
import { getErrorMessage } from '@/lib/api-error';
import { PAYMENT_METHODS, PAYMENT_TYPES, type Payment } from '@/types/domain';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/utils/dates';
import { paymentMethodLabels, paymentTypeLabels } from '@/utils/labels';
import { toast } from 'sonner';

function defaultValues(payment?: Payment): PaymentFormValues {
  return {
    amount: payment?.amount ?? 0,
    type: payment?.type ?? 'DEPOSIT',
    paymentMethod: payment?.paymentMethod ?? 'CASH',
    paidAt: toDateTimeLocalValue(payment?.paidAt),
    notes: payment?.notes ?? '',
  };
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  orderId,
  payment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  payment?: Payment;
}) {
  const create = useCreatePayment(orderId);
  const update = useUpdatePayment(orderId);
  const isEdit = Boolean(payment);
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema) as Resolver<PaymentFormValues>,
    defaultValues: defaultValues(payment),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues(payment));
  }, [form, open, payment]);

  async function onSubmit(values: PaymentFormValues) {
    const input = {
      amount: Number(values.amount),
      type: values.type,
      paymentMethod: values.paymentMethod,
      paidAt: fromDateTimeLocalValue(values.paidAt),
      notes: values.notes || undefined,
    };

    try {
      if (isEdit && payment) {
        await update.mutateAsync({ paymentId: payment.id, input });
        toast.success('Pago actualizado.');
      } else {
        await create.mutateAsync(input);
        toast.success('Pago registrado.');
      }
      onOpenChange(false);
    } catch (error) {
      applyFieldErrors(error, form.setError);
      form.setError('root', { message: getErrorMessage(error) });
    }
  }

  const pending = create.isPending || update.isPending || form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar pago' : 'Registrar pago'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <Field>
            <Label htmlFor="amount">Monto</Label>
            <Input id="amount" type="number" min={0.01} step="0.01" inputMode="decimal" {...form.register('amount', { valueAsNumber: true })} />
            <FieldError>{form.formState.errors.amount?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="payment-type">Tipo</Label>
            <NativeSelect id="payment-type" {...form.register('type')}>
              {PAYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {paymentTypeLabels[type]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <Label htmlFor="payment-method">Medio</Label>
            <NativeSelect id="payment-method" {...form.register('paymentMethod')}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {paymentMethodLabels[method]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <Label htmlFor="paidAt">Fecha y hora</Label>
            <Input id="paidAt" type="datetime-local" {...form.register('paidAt')} />
            <FieldError>{form.formState.errors.paidAt?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="payment-notes">Notas</Label>
            <Textarea id="payment-notes" {...form.register('notes')} />
          </Field>
          <FieldError>{form.formState.errors.root?.message}</FieldError>
          <DialogFooter>
            <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="w-full sm:w-auto" type="submit" disabled={pending}>
              {pending ? 'Guardando…' : isEdit ? 'Guardar' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
