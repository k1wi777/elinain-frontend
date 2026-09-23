/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado de
 * `ApiError` con estos mensajes.
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_LISTAR =
  "No se pudo cargar el listado de ciclos. Inténtalo de nuevo.";

const MENSAJE_GUARDAR_DATOS =
  "No se pudo guardar el ciclo: revisa los datos o verifica que el contrato no esté cerrado.";
const MENSAJE_GUARDAR_NO_EXISTE = "El ciclo no existe.";
const MENSAJE_GUARDAR_GENERICO =
  "No se pudo guardar el ciclo. Inténtalo de nuevo.";

const MENSAJE_ELIMINAR_DATOS =
  "No se pudo eliminar el ciclo: revisa la solicitud o verifica el estado del contrato.";
const MENSAJE_ELIMINAR_NO_EXISTE = "El ciclo no existe.";
const MENSAJE_ELIMINAR_GENERICO =
  "No se pudo eliminar el ciclo. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo al cargar el listado de ciclos.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorListarCiclos(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_LISTAR;
}

/**
 * Mensaje para un fallo al registrar o editar un ciclo.
 *
 * El `400` agrupa los datos inválidos y el contrato cerrado, que el backend no distingue en
 * el código de estado.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorGuardarCiclo(status: number): string {
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
 * Mensaje para un fallo al eliminar un ciclo.
 *
 * El `400` agrupa la solicitud inválida y el contrato cerrado, que el backend no distingue
 * en el código de estado.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorEliminarCiclo(status: number): string {
  if (status === 400) {
    return MENSAJE_ELIMINAR_DATOS;
  }

  if (status === 404) {
    return MENSAJE_ELIMINAR_NO_EXISTE;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_ELIMINAR_GENERICO;
}
