/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado
 * de `ApiError` con estos mensajes. La vista solo realiza una operación de lectura, por
 * lo que existe un único mensaje de error.
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_CARGAR =
  "No se pudo cargar el resumen del panel. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo al cargar el resumen del dashboard.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorDashboard(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_CARGAR;
}
