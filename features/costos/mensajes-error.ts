/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado de
 * `ApiError` con estos mensajes. Crear y editar se separan para que el `404` sea preciso:
 * al crear el recurso ausente es el contrato, al editar lo es el costo.
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_LISTAR =
  "No se pudo cargar el listado de costos. Inténtalo de nuevo.";

const MENSAJE_CREAR_DATOS =
  "No se pudo registrar el costo: revisa los datos o verifica que el contrato no esté cerrado.";
const MENSAJE_CREAR_CONTRATO_NO_EXISTE = "El contrato no existe.";
const MENSAJE_CREAR_GENERICO =
  "No se pudo registrar el costo. Inténtalo de nuevo.";

const MENSAJE_EDITAR_DATOS =
  "No se pudo guardar el costo: revisa los datos o verifica que el contrato no esté cerrado.";
const MENSAJE_EDITAR_NO_EXISTE = "El costo no existe.";
const MENSAJE_EDITAR_GENERICO =
  "No se pudo guardar el costo. Inténtalo de nuevo.";

const MENSAJE_ELIMINAR_DATOS =
  "No se pudo eliminar el costo: revisa la solicitud o verifica el estado del contrato.";
const MENSAJE_ELIMINAR_NO_EXISTE = "El costo no existe.";
const MENSAJE_ELIMINAR_GENERICO =
  "No se pudo eliminar el costo. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo al cargar el listado de costos.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorListarCostos(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_LISTAR;
}

/**
 * Mensaje para un fallo al registrar un costo.
 *
 * El `400` agrupa los datos inválidos y el contrato cerrado, que el backend no distingue en
 * el código de estado.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorCrearCosto(status: number): string {
  if (status === 400) {
    return MENSAJE_CREAR_DATOS;
  }

  if (status === 404) {
    return MENSAJE_CREAR_CONTRATO_NO_EXISTE;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_CREAR_GENERICO;
}

/**
 * Mensaje para un fallo al editar un costo.
 *
 * El `400` agrupa los datos inválidos y el contrato cerrado, que el backend no distingue en
 * el código de estado.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorEditarCosto(status: number): string {
  if (status === 400) {
    return MENSAJE_EDITAR_DATOS;
  }

  if (status === 404) {
    return MENSAJE_EDITAR_NO_EXISTE;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_EDITAR_GENERICO;
}

/**
 * Mensaje para un fallo al eliminar un costo.
 *
 * El `400` agrupa la solicitud inválida y el contrato cerrado, que el backend no distingue
 * en el código de estado.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorEliminarCosto(status: number): string {
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
