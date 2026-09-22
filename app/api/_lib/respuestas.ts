import { NextResponse } from "next/server";

/**
 * Mensajes controlados del BFF por código de estado.
 *
 * Evitan reenviar al navegador el detalle técnico del backend: el BFF solo propaga el
 * código HTTP real y un mensaje en español. Cada feature puede sobrescribirlos pasando
 * sus propios mensajes a {@link respuestaError}.
 */
const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: "La solicitud contiene datos inválidos.",
  401: "Tu sesión no es válida o ha expirado.",
  404: "El recurso solicitado no existe.",
  409: "La operación entra en conflicto con el estado actual.",
  500: "Ocurrió un error en el servidor.",
  502: "No se pudo conectar con el servicio. Inténtalo de nuevo.",
};

const MENSAJE_GENERICO = "Ocurrió un error inesperado.";

/**
 * Construye una respuesta de error del BFF conservando el código HTTP real.
 *
 * Un fallo de red (`status === 0`) se traduce a `502`; cualquier estado desconocido se
 * propaga con un mensaje genérico en español. Los `mensajes` recibidos sobrescriben la
 * base por código de estado.
 *
 * @param status Código HTTP del fallo, o `0` si proviene de la red.
 * @param mensajes Mensajes específicos del feature indexados por código de estado.
 */
export function respuestaError(
  status: number,
  mensajes?: Partial<Record<number, string>>,
): NextResponse {
  const estado = status === 0 ? 502 : status;
  const mensaje =
    mensajes?.[estado] ?? MENSAJES_POR_ESTADO[estado] ?? MENSAJE_GENERICO;

  return NextResponse.json({ mensaje }, { status: estado });
}
