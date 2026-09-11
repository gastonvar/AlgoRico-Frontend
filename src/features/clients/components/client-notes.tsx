import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateClient } from '@/features/clients/hooks/use-clients';
import { getErrorMessage } from '@/lib/api-error';
import type { Client } from '@/types/domain';
import { toast } from 'sonner';

export function ClientNotes({ client }: { client: Client }) {
  const update = useUpdateClient(client.id);
  const [notes, setNotes] = useState(client.notes ?? '');
  const dirty = notes !== (client.notes ?? '');

  return (
    <div className="min-w-0">
      <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      <div className="mt-3 flex justify-end">
        <Button
          className="w-full sm:w-auto"
          disabled={!dirty || update.isPending}
          onClick={async () => {
            try {
              await update.mutateAsync({ notes: notes.trim() ? notes : null });
              toast.success('Notas guardadas.');
            } catch (error) {
              toast.error(getErrorMessage(error));
            }
          }}
        >
          {update.isPending ? 'Guardando…' : 'Guardar notas'}
        </Button>
      </div>
    </div>
  );
}
