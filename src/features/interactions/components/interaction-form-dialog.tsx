import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FilePreviewList } from '@/features/attachments/components/attachment-gallery';
import { useUploadInteractionAttachments } from '@/features/attachments/hooks/use-attachments';
import { useCreateInteraction, useUpdateInteraction } from '@/features/interactions/hooks/use-interactions';
import { interactionFormSchema, type InteractionFormValues } from '@/features/interactions/schemas/interaction-schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { applyFieldErrors } from '@/lib/form-errors';
import { getErrorMessage } from '@/lib/api-error';
import { INTERACTION_CHANNELS, type Interaction } from '@/types/domain';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/utils/dates';
import { interactionChannelLabels } from '@/utils/labels';
import { toast } from 'sonner';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type InteractionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  orderId?: string;
  interaction?: Interaction;
};

function defaultValues(interaction?: Interaction): InteractionFormValues {
  return {
    channel: interaction?.channel ?? 'WHATSAPP',
    occurredAt: toDateTimeLocalValue(interaction?.occurredAt),
    content: interaction?.content ?? '',
  };
}

export function InteractionFormDialog({
  open,
  onOpenChange,
  clientId,
  orderId,
  interaction,
}: InteractionFormDialogProps) {
  const create = useCreateInteraction(clientId, orderId);
  const update = useUpdateInteraction(clientId, orderId ?? interaction?.orderId ?? undefined);
  const upload = useUploadInteractionAttachments(clientId, orderId ?? interaction?.orderId ?? undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const isEdit = Boolean(interaction);

  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: defaultValues(interaction),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues(interaction));
    setFiles([]);
    setProgress(null);
  }, [form, interaction, open]);

  function resetAndClose() {
    form.reset(defaultValues());
    setFiles([]);
    setProgress(null);
    onOpenChange(false);
  }

  async function onSubmit(values: InteractionFormValues) {
    try {
      const saved = isEdit && interaction
        ? await update.mutateAsync({
            interactionId: interaction.id,
            input: {
              channel: values.channel,
              content: values.content,
              occurredAt: fromDateTimeLocalValue(values.occurredAt),
            },
          })
        : await create.mutateAsync({
            channel: values.channel,
            content: values.content,
            occurredAt: fromDateTimeLocalValue(values.occurredAt),
          });

      if (files.length > 0) {
        try {
          await upload.mutateAsync({
            interactionId: saved.id,
            files,
            onProgress: setProgress,
          });
        } catch (error) {
          toast.error(`La conversación se guardó, pero algunas imágenes no se subieron. ${getErrorMessage(error)}`);
          resetAndClose();
          return;
        }
      }

      toast.success(isEdit ? 'Conversación actualizada.' : 'Conversación guardada.');
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
          <DialogTitle>{isEdit ? 'Editar conversación' : 'Nueva conversación'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualizá el canal, la fecha o lo que hablaron. Podés sumar capturas nuevas.'
              : 'Registrá lo que hablaron y las capturas que enviaron.'}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field>
            <Label htmlFor="channel">Canal</Label>
            <NativeSelect id="channel" {...form.register('channel')}>
              {INTERACTION_CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {interactionChannelLabels[channel]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <Label htmlFor="occurredAt">Fecha y hora</Label>
            <Input id="occurredAt" type="datetime-local" className="min-h-11" {...form.register('occurredAt')} />
            <FieldError>{form.formState.errors.occurredAt?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="content">Qué hablaron</Label>
            <Textarea id="content" className="min-h-32" {...form.register('content')} />
            <FieldError>{form.formState.errors.content?.message}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="screenshots">{isEdit ? 'Capturas nuevas' : 'Capturas'}</Label>
            <Input
              id="screenshots"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="h-auto min-h-12 cursor-pointer py-2.5 file:mr-3 file:rounded-lg file:bg-secondary file:px-3 file:py-2 file:text-sm"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []).filter((file) => ALLOWED_TYPES.includes(file.type));
                setFiles((current) => [...current, ...selected]);
                event.target.value = '';
              }}
            />
            <FilePreviewList files={files} onRemove={(index) => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
            {progress !== null ? <p className="text-sm text-muted-foreground">Subiendo… {progress}%</p> : null}
          </Field>
          <FieldError>{form.formState.errors.root?.message}</FieldError>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => resetAndClose()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
