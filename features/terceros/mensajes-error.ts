/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado
 * de `ApiError` con estos mensajes.
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_LISTAR =
  "No se pudo cargar el listado de socios de participación. Inténtalo de nuevo.";

const MENSAJE_GUARDAR_DATOS = "Revisa los datos del socio de participación.";
const MENSAJE_GUARDAR_NO_EXISTE = "El socio de participación no existe.";
const MENSAJE_GUARDAR_GENERICO =
  "No se pudo guardar el socio de participación. Inténtalo de nuevo.";

const MENSAJE_ELIMINAR_CONTRATOS =
  "No se puede eliminar el socio de participación porque tiene contratos activos asociados.";
const MENSAJE_ELIMINAR_NO_EXISTE = "El socio de participación no existe.";
const MENSAJE_ELIMINAR_GENERICO =
  "No se pudo eliminar el socio de participación. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo al cargar el listado de socios de participación.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorListarTerceros(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_LISTAR;
}

/**
 * Mensaje para un fallo al crear o editar un socio de participación.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorGuardarTercero(status: number): string {
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
 * Mensaje para un fallo al eliminar un socio de participación.
 *
 * El `409` indica que el socio tiene contratos activos asociados y no puede eliminarse.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorEliminarTercero(status: number): string {
  if (status === 409) {
    return MENSAJE_ELIMINAR_CONTRATOS;
  }

  if (status === 404) {
    return MENSAJE_ELIMINAR_NO_EXISTE;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_ELIMINAR_GENERICO;
}
