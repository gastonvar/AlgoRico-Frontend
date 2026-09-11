export type FieldError = {
  path: string;
  message: string;
};

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseDetails(details: unknown): FieldError[] {
  if (!Array.isArray(details)) {
    return [];
  }

  return details.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    const path = typeof item.path === 'string' ? item.path : '';
    const message = typeof item.message === 'string' ? item.message : '';
    if (!message) {
      return [];
    }
    return [{ path, message }];
  });
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldError[];

  constructor(options: {
    status: number;
    code: string;
    message: string;
    fieldErrors?: FieldError[];
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors ?? [];
  }

  static fromUnknown(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (isAxiosLike(error)) {
      const status = error.response?.status ?? 0;
      const body = error.response?.data as ErrorBody | undefined;
      const code = body?.error?.code ?? (status === 0 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR');
      const message =
        body?.error?.message ??
        (status === 0 ? 'No pudimos conectar con el servidor.' : 'Ocurrió un error inesperado.');
      return new ApiError({
        status,
        code,
        message,
        fieldErrors: parseDetails(body?.error?.details),
      });
    }

    if (error instanceof Error) {
      return new ApiError({
        status: 0,
        code: 'UNKNOWN_ERROR',
        message: error.message,
      });
    }

    return new ApiError({
      status: 0,
      code: 'UNKNOWN_ERROR',
      message: 'Ocurrió un error inesperado.',
    });
  }
}

type AxiosLike = {
  isAxiosError?: boolean;
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
};

function isAxiosLike(error: unknown): error is AxiosLike {
  return isRecord(error) && ('isAxiosError' in error || 'response' in error);
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'No pudimos completar esta acción. Revisá los datos e intentá de nuevo.',
  401: 'Tu sesión expiró. Iniciá sesión de nuevo.',
  403: 'No tenés permiso para hacer esta acción.',
  404: 'No encontramos lo que buscás.',
  409: 'No se pudo completar porque hay un conflicto con los datos actuales.',
  413: 'El archivo es demasiado grande.',
  422: 'Revisá los datos e intentá de nuevo.',
  500: 'Algo salió mal. Intentá de nuevo.',
};

export function getErrorMessage(error: unknown): string {
  const apiError = ApiError.fromUnknown(error);

  if (apiError.code === 'NETWORK_ERROR' || apiError.status === 0) {
    return 'No pudimos conectar con el servidor. Revisá tu conexión.';
  }

  if (apiError.message === 'Invalid email or password') {
    return 'El correo o la contraseña no son correctos.';
  }

  if (apiError.message && apiError.message !== 'Request validation failed') {
    if (apiError.status === 409 || apiError.status === 422 || apiError.status === 400) {
      return translateBackendMessage(apiError.message);
    }
  }

  return STATUS_MESSAGES[apiError.status] ?? translateBackendMessage(apiError.message);
}

function translateBackendMessage(message: string): string {
  const known: Record<string, string> = {
    'Invalid email or password': 'El correo o la contraseña no son correctos.',
    'Authentication required': 'Tu sesión expiró. Iniciá sesión de nuevo.',
    'Client not found': 'No encontramos este cliente.',
    'Order not found': 'No encontramos este pedido.',
    'Interaction not found': 'No encontramos esta conversación.',
    'Task not found': 'No encontramos esta tarea.',
    'Payment not found': 'No encontramos este pago.',
    'Attachment not found': 'No encontramos este archivo.',
    'At least one file is required': 'Tenés que adjuntar al menos un archivo.',
    'File upload failed': 'No se pudo subir el archivo. Intentá de nuevo.',
    'You are not allowed to perform this action': 'No tenés permiso para hacer esta acción.',
    'Payment exceeds the remaining balance': 'El pago supera lo que resta del pedido.',
    'New total would be lower than existing payments': 'El precio final no puede ser menor a lo ya pagado.',
    'Invalid CSRF token': 'La sesión no es válida. Recargá la página e intentá de nuevo.',
  };

  return known[message] ?? message;
}
