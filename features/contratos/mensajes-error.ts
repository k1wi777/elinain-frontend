/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado
 * de `ApiError` con estos mensajes.
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_LISTAR =
  "No se pudo cargar el listado de contratos. Inténtalo de nuevo.";

const MENSAJE_GUARDAR_DATOS = "Revisa los datos del contrato.";
const MENSAJE_GUARDAR_NO_EXISTE = "El contrato no existe.";
const MENSAJE_GUARDAR_GENERICO =
  "No se pudo guardar el contrato. Inténtalo de nuevo.";

const MENSAJE_DETALLE_NO_EXISTE = "El contrato no existe.";
const MENSAJE_DETALLE_GENERICO =
  "No se pudo cargar el contrato. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo al cargar el listado de contratos.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorListarContratos(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_LISTAR;
}

/**
 * Mensaje para un fallo al abrir o editar un contrato.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorGuardarContrato(status: number): string {
  if (status === 400) {
    return MENSAJE_GUARDAR_DATOS;
  }

  if (status === 404) {
    return MENSAJE_GUARDAR_NO_EXISTE;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_GUARDAR_GENERICO;
}

/**
 * Mensaje para un fallo al cargar el detalle de un contrato.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorDetalleContrato(status: number): string {
  if (status === 404) {
    return MENSAJE_DETALLE_NO_EXISTE;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_DETALLE_GENERICO;
}
