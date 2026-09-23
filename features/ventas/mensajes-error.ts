/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado de
 * `ApiError` con estos mensajes.
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_LISTAR =
  "No se pudo cargar el listado de ventas. Inténtalo de nuevo.";

const MENSAJE_GUARDAR_DATOS = "Revisa los datos de la venta.";
const MENSAJE_GUARDAR_CONTRATO_NO_EXISTE = "El contrato no existe.";
const MENSAJE_GUARDAR_GENERICO =
  "No se pudo guardar la venta. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo al cargar el listado de ventas.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorListarVentas(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_LISTAR;
}

/**
 * Mensaje para un fallo al registrar una venta.
 *
 * El `404` indica que el contrato de la venta no existe.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorGuardarVenta(status: number): string {
  if (status === 400) {
    return MENSAJE_GUARDAR_DATOS;
  }

  if (status === 404) {
    return MENSAJE_GUARDAR_CONTRATO_NO_EXISTE;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_GUARDAR_GENERICO;
}
