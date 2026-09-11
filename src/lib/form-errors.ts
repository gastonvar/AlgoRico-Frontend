import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/lib/api-error';

export function applyFieldErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  if (!(error instanceof ApiError)) {
    return;
  }

  for (const fieldError of error.fieldErrors) {
    if (!fieldError.path) {
      continue;
    }
    setError(fieldError.path as FieldPath<T>, { type: 'server', message: fieldError.message });
  }
}
