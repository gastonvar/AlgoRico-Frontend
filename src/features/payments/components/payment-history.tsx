import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DateDisplay } from '@/components/common/date-display';
import { ItemActions } from '@/components/common/item-actions';
import { MoneyDisplay } from '@/components/common/money-display';
import { AttachmentGallery } from '@/features/attachments/components/attachment-gallery';
import { PaymentFormDialog } from '@/features/payments/components/payment-form-dialog';
import { useDeletePayment } from '@/features/payments/hooks/use-payments';
import { getErrorMessage } from '@/lib/api-error';
import type { Payment } from '@/types/domain';
import { paymentMethodLabels, paymentTypeLabels } from '@/utils/labels';
import { toast } from 'sonner';

export function PaymentHistory({ payments, orderId }: { payments: Payment[]; orderId: string }) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay pagos registrados.</p>;
  }

  return (
    <ul className="space-y-3">
      {payments.map((payment) => (
        <PaymentRow key={payment.id} payment={payment} orderId={orderId} />
      ))}
    </ul>
  );
}

function PaymentRow({ payment, orderId }: { payment: Payment; orderId: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const remove = useDeletePayment(orderId);

  return (
    <li className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words font-medium">
            {paymentTypeLabels[payment.type]} · {paymentMethodLabels[payment.paymentMethod]}
          </p>
          <p className="text-sm text-muted-foreground">
            <DateDisplay value={payment.paidAt} mode="relative" />
          </p>
          <MoneyDisplay amount={payment.amount} emphasize className="mt-1" />
          <p className="mt-1 text-sm text-muted-foreground">
            {payment.hasPaymentReceipt ? 'Con comprobante' : 'Sin comprobante'}
          </p>
          {payment.notes ? <p className="mt-1 break-words text-sm">{payment.notes}</p> : null}
        </div>
        <ItemActions
          editLabel="Editar pago"
          deleteLabel="Eliminar pago"
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>
      <div className="mt-2">
        <AttachmentGallery attachments={payment.attachments} orderId={orderId} />
      </div>
      <PaymentFormDialog open={editOpen} onOpenChange={setEditOpen} orderId={orderId} payment={payment} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar pago?"
        description="Se va a borrar este pago y se va a recalcular lo que resta. No se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          try {
            await remove.mutateAsync(payment.id);
            toast.success('Pago eliminado.');
            setDeleteOpen(false);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </li>
  );
}
