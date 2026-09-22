/**
 * Error único del cliente HTTP y mapeo centralizado de los errores del backend.
 *
 * Todos los fallos —respuestas de error del backend, fallos de red o errores
 * desconocidos— se normalizan en un `ApiError`, de modo que las funciones de `api/` de
 * los features solo dependan de este tipo.
 */

/** Opciones complementarias de un `ApiError`. */
export type ApiErrorOptions = {
  /** Lista de restricciones o detalles devueltos por el backend. */
  errores?: string[];
  /** Ruta donde ocurrió el error. */
  ruta?: string;
  /** Marca de tiempo ISO 8601 del error. */
  marcaTiempo?: string;
};

/** Error tipado que expone el estado HTTP y un mensaje legible. */
export class ApiError extends Error {
  /** Código de estado HTTP; `0` cuando el fallo no proviene del backend. */
  readonly status: number;
  /** Detalles de validación reportados por el backend. */
  readonly errores: string[];
  /** Ruta donde ocurrió el error, si el backend la informa. */
  readonly ruta?: string;
  /** Marca de tiempo ISO 8601 del error, si el backend la informa. */
  readonly marcaTiempo?: string;

  constructor(status: number, message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errores = options.errores ?? [];
    this.ruta = options.ruta;
    this.marcaTiempo = options.marcaTiempo;
  }
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: "La solicitud contiene datos inválidos.",
  401: "Tu sesión no es válida o ha expirado.",
  403: "No tienes permisos para realizar esta acción.",
  404: "El recurso solicitado no existe.",
  409: "La operación entra en conflicto con el estado actual.",
  500: "Ocurrió un error en el servidor.",
};

const DEFAULT_ERROR_MESSAGE = "Ocurrió un error inesperado.";

const NETWORK_ERROR_MESSAGE =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

/** Error de axios reconocido por su marca estructural, sin depender de su clase. */
type AxiosLikeError = {
  isAxiosError: true;
  response?: {
    status?: number;
    data?: unknown;
  };
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function readString(
  record: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = record?.[key];

  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }

  return undefined;
}

function readStringArray(
  record: Record<string, unknown> | undefined,
  key: string,
): string[] {
  const value = record?.[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function defaultMessageFor(status: number): string {
  return DEFAULT_MESSAGES[status] ?? DEFAULT_ERROR_MESSAGE;
}

/**
 * Interpreta el cuerpo de una respuesta de error del backend y lo convierte en un
 * `ApiError`.
 *
 * Si el cuerpo incluye `mensaje` lo usa como mensaje; en caso contrario aplica un mensaje
 * por defecto acorde al estado. Recoge `errores` cuando es un array de strings.
 *
 * @param status Código de estado HTTP de la respuesta.
 * @param data Cuerpo de la respuesta, aún sin interpretar.
 */
export function mapErrorResponse(status: number, data: unknown): ApiError {
  const body = asRecord(data);

  const message = readString(body, "mensaje") ?? defaultMessageFor(status);

  return new ApiError(status, message, {
    errores: readStringArray(body, "errores"),
    ruta: readString(body, "ruta"),
    marcaTiempo: readString(body, "marcaTiempo"),
  });
}

function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return (error as { isAxiosError?: unknown }).isAxiosError === true;
}

/**
 * Normaliza cualquier fallo en un `ApiError`.
 *
 * - Si ya es un `ApiError`, lo devuelve sin cambios.
 * - Si es un error de axios con respuesta, delega en `mapErrorResponse`.
 * - Si es un fallo de red o un error desconocido, devuelve `status: 0` con un mensaje en
 *   español.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosLikeError(error)) {
    const status = error.response?.status;

    if (typeof status === "number") {
      return mapErrorResponse(status, error.response?.data);
    }

    return new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  return new ApiError(0, DEFAULT_ERROR_MESSAGE);
}
