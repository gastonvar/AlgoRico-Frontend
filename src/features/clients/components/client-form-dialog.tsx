import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { clientFormSchema, type ClientFormValues } from '@/features/clients/schemas/client-schemas';
import type { Client } from '@/types/domain';

type ClientFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  pending?: boolean;
};

export function ClientFormDialog({ open, onOpenChange, client, onSubmit, pending }: ClientFormDialogProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    values: {
      name: client?.name ?? '',
      phone: client?.phone ?? '',
      instagramUsername: client?.instagramUsername ?? '',
      email: client?.email ?? '',
      notes: client?.notes ?? '',
      needsFollowUp: client?.needsFollowUp ?? false,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogDescription>Guardá los datos de contacto para seguir la conversación.</DialogDescription>
        </DialogHeader>
        <form
          className="grid grid-cols-1 gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
        >
          <Field>
            <Label htmlFor="client-name">Nombre</Label>
            <Input id="client-name" autoComplete="name" autoCapitalize="words" {...form.register('name')} />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="client-phone">Teléfono</Label>
            <Input id="client-phone" type="tel" inputMode="tel" autoComplete="tel" {...form.register('phone')} />
            <FieldError>{form.formState.errors.phone?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="client-ig">Instagram</Label>
            <Input
              id="client-ig"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              placeholder="@usuario"
              {...form.register('instagramUsername')}
            />
            <FieldError>{form.formState.errors.instagramUsername?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="client-email">Correo</Label>
            <Input id="client-email" type="email" inputMode="email" autoComplete="email" {...form.register('email')} />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="client-notes">Notas</Label>
            <Textarea id="client-notes" {...form.register('notes')} />
            <FieldError>{form.formState.errors.notes?.message}</FieldError>
          </Field>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <Checkbox
              checked={form.watch('needsFollowUp')}
              onCheckedChange={(checked) => form.setValue('needsFollowUp', checked === true)}
            />
            Hay que responderle
          </label>
          <FieldError>{form.formState.errors.root?.message}</FieldError>
          <DialogFooter>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={pending || form.formState.isSubmitting}>
              {pending || form.formState.isSubmitting ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
