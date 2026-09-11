import { Download, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAttachment, useDeleteAttachment } from '@/features/attachments/hooks/use-attachments';
import { getErrorMessage } from '@/lib/api-error';
import type { Attachment } from '@/types/domain';
import { toast } from 'sonner';

const thumbClassName = 'h-28 w-28 sm:h-24 sm:w-24';

function AttachmentImage({ attachment, onOpen }: { attachment: Attachment; onOpen: () => void }) {
  const query = useAttachment(attachment.id);

  if (query.isLoading) {
    return <Skeleton className={`${thumbClassName} rounded-lg`} />;
  }

  if (query.error || !query.data) {
    return (
      <div className={`flex ${thumbClassName} items-center justify-center rounded-lg border text-xs text-muted-foreground`}>
        Sin vista
      </div>
    );
  }

  return (
    <button type="button" className="overflow-hidden rounded-lg border" onClick={onOpen} aria-label={attachment.originalFilename}>
      <img
        src={query.data.downloadUrl}
        alt={attachment.originalFilename}
        className={`${thumbClassName} object-cover`}
        loading="lazy"
      />
    </button>
  );
}

type AttachmentGalleryProps = {
  attachments: Attachment[];
  clientId?: string;
  orderId?: string;
};

export function AttachmentGallery({ attachments, clientId, orderId }: AttachmentGalleryProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const active = attachments.find((item) => item.id === activeId);
  const activeQuery = useAttachment(activeId ?? undefined);
  const remove = useDeleteAttachment({ clientId, orderId });

  if (attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex min-w-0 flex-wrap gap-2">
        {attachments.map((attachment) => (
          <AttachmentImage key={attachment.id} attachment={attachment} onOpen={() => setActiveId(attachment.id)} />
        ))}
      </div>
      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActiveId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="pr-10 break-words">{active?.originalFilename ?? 'Imagen'}</DialogTitle>
          {activeQuery.data ? (
            <img
              src={activeQuery.data.downloadUrl}
              alt={active?.originalFilename}
              className="max-h-[min(52dvh,24rem)] w-full rounded-lg object-contain sm:max-h-[70vh]"
              loading="lazy"
            />
          ) : (
            <Skeleton className="h-48 w-full sm:h-80" />
          )}
          <div className="flex justify-end gap-2">
            {activeQuery.data ? (
              <a
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm"
                href={activeQuery.data.downloadUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Download className="h-4 w-4" />
                Abrir
              </a>
            ) : null}
            {active ? (
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-destructive text-destructive"
                onClick={() => setPendingDelete(active.id)}
                aria-label="Eliminar imagen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="¿Eliminar imagen?"
        description="La captura se va a borrar y no se puede recuperar."
        confirmLabel="Eliminar"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await remove.mutateAsync(pendingDelete);
            toast.success('Imagen eliminada.');
            setPendingDelete(null);
            setActiveId(null);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </>
  );
}

type FilePreviewListProps = {
  files: File[];
  onRemove: (index: number) => void;
};

function FileThumb({ file, index, onRemove }: { file: File; index: number; onRemove: (index: number) => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return (
    <li className="relative">
      {url ? (
        <img src={url} alt={file.name} className="h-24 w-24 rounded-lg object-cover sm:h-20 sm:w-20" loading="lazy" />
      ) : (
        <span className="flex h-24 w-24 items-center justify-center rounded-lg border text-xs sm:h-20 sm:w-20">{file.name}</span>
      )}
      <button
        type="button"
        className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background"
        onClick={() => onRemove(index)}
        aria-label={`Quitar ${file.name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </li>
  );
}

export function FilePreviewList({ files, onRemove }: FilePreviewListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <FileThumb key={`${file.name}-${index}`} file={file} index={index} onRemove={onRemove} />
      ))}
    </ul>
  );
}
