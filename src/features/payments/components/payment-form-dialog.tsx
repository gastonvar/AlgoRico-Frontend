import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { FilePreviewList } from '@/features/attachments/components/attachment-gallery';
import { useUploadPaymentAttachments } from '@/features/attachments/hooks/use-attachments';
import { useCreatePayment, useUpdatePayment } from '@/features/payments/hooks/use-payments';
import { paymentFormSchema, type PaymentFormValues } from '@/features/payments/schemas/payment-schemas';
import { applyFieldErrors } from '@/lib/form-errors';
import { getErrorMessage } from '@/lib/api-error';
import { PAYMENT_METHODS, PAYMENT_TYPES, type Order, type Payment } from '@/types/domain';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/utils/dates';
import { paymentMethodLabels, paymentTypeLabels } from '@/utils/labels';
import { toast } from 'sonner';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function defaultValues(payment?: Payment): PaymentFormValues {
  return {
    amount: payment?.amount ?? 0,
    type: payment?.type ?? 'DEPOSIT',
    paymentMethod: payment?.paymentMethod ?? 'CASH',
    paidAt: toDateTimeLocalValue(payment?.paidAt),
    notes: payment?.notes ?? '',
    hasPaymentReceipt: payment?.hasPaymentReceipt ?? false,
  };
}

function newestPayment(order: Order | null | undefined): Payment | undefined {
  const payments = order?.payments ?? [];
  if (payments.length === 0) {
    return undefined;
  }
  return [...payments].sort((left, right) => {
    const byCreated = (right.createdAt ?? '').localeCompare(left.createdAt ?? '');
    if (byCreated !== 0) return byCreated;
    return right.id.localeCompare(left.id);
  })[0];
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
  const upload = useUploadPaymentAttachments(orderId);
  const isEdit = Boolean(payment);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema) as Resolver<PaymentFormValues>,
    defaultValues: defaultValues(payment),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues(payment));
    setFile(null);
    setProgress(null);
  }, [form, open, payment]);

  function resetAndClose() {
    form.reset(defaultValues());
    setFile(null);
    setProgress(null);
    onOpenChange(false);
  }

  async function onSubmit(values: PaymentFormValues) {
    const hasPaymentReceipt = values.hasPaymentReceipt || Boolean(file);
    const input = {
      amount: Number(values.amount),
      type: values.type,
      paymentMethod: values.paymentMethod,
      paidAt: fromDateTimeLocalValue(values.paidAt),
      notes: values.notes || undefined,
      hasPaymentReceipt,
    };

    try {
      let paymentId = payment?.id;
      if (isEdit && payment) {
        await update.mutateAsync({ paymentId: payment.id, input });
      } else {
        const order = await create.mutateAsync(input);
        paymentId = newestPayment(order)?.id;
      }

      if (file) {
        if (!paymentId) {
          toast.error('El pago se guardó, pero no se pudo subir la imagen.');
          resetAndClose();
          return;
        }
        try {
          await upload.mutateAsync({
            paymentId,
            files: [file],
            onProgress: setProgress,
          });
        } catch (error) {
          toast.error(`El pago se guardó, pero la imagen no se subió. ${getErrorMessage(error)}`);
          resetAndClose();
          return;
        }
      }

      toast.success(isEdit ? 'Pago actualizado.' : 'Pago registrado.');
      resetAndClose();
    } catch (error) {
      applyFieldErrors(error, form.setError);
      form.setError('root', { message: getErrorMessage(error) });
    }
  }

  const pending = create.isPending || update.isPending || upload.isPending || form.formState.isSubmitting;

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
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <Checkbox
              checked={form.watch('hasPaymentReceipt')}
              onCheckedChange={(checked) => form.setValue('hasPaymentReceipt', checked === true)}
            />
            Comprobante de pago
          </label>
          <Field>
            <Label htmlFor="payment-receipt">{isEdit ? 'Imagen nueva del comprobante' : 'Imagen del comprobante'}</Label>
            <Input
              id="payment-receipt"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="h-auto min-h-12 cursor-pointer py-2.5 file:mr-3 file:rounded-lg file:bg-secondary file:px-3 file:py-2 file:text-sm"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []).find((item) => ALLOWED_TYPES.includes(item.type));
                setFile(selected ?? null);
                if (selected) {
                  form.setValue('hasPaymentReceipt', true);
                }
                event.target.value = '';
              }}
            />
            <p className="text-sm text-muted-foreground">Opcional. JPEG, PNG o WebP.</p>
            <FilePreviewList files={file ? [file] : []} onRemove={() => setFile(null)} />
            {progress !== null ? <p className="text-sm text-muted-foreground">Subiendo… {progress}%</p> : null}
          </Field>
          <FieldError>{form.formState.errors.root?.message}</FieldError>
          <DialogFooter>
            <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => resetAndClose()}>
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
