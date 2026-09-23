/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado
 * de `ApiError` con estos mensajes. Cada vista de solo lectura tiene su propio mensaje
 * genérico y comparte el de fallo de conexión.
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_CARGAR_CONTRATOS =
  "No se pudo cargar el reporte de contratos activos. Inténtalo de nuevo.";

const MENSAJE_CARGAR_HISTORIAL =
  "No se pudo cargar el historial de ventas. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo al cargar el reporte de contratos activos.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorContratosActivos(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_CARGAR_CONTRATOS;
}

/**
 * Mensaje para un fallo al cargar el historial de ventas.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorHistorialVentas(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_CARGAR_HISTORIAL;
}
