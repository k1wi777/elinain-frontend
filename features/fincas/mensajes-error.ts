/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado
 * de `ApiError` con estos mensajes.
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_LISTAR =
  "No se pudo cargar el listado de fincas. Inténtalo de nuevo.";

const MENSAJE_GUARDAR_DATOS = "Revisa los datos de la finca.";
const MENSAJE_GUARDAR_NO_EXISTE = "La finca no existe.";
const MENSAJE_GUARDAR_GENERICO =
  "No se pudo guardar la finca. Inténtalo de nuevo.";

const MENSAJE_ELIMINAR_CONTRATOS =
  "No se puede eliminar la finca porque tiene contratos vinculados.";
const MENSAJE_ELIMINAR_NO_EXISTE = "La finca no existe.";
const MENSAJE_ELIMINAR_GENERICO =
  "No se pudo eliminar la finca. Inténtalo de nuevo.";

const MENSAJE_GEOCODIFICACION_NO_ENCONTRADA =
  "No se encontró la dirección indicada.";
const MENSAJE_GEOCODIFICACION_GENERICO =
  "No se pudo buscar la dirección. Inténtalo de nuevo.";

const MENSAJE_GEOCODIFICACION_INVERSA_NO_ENCONTRADA =
  "No se pudo determinar una dirección para ese punto.";
const MENSAJE_GEOCODIFICACION_INVERSA_GENERICO =
  "No se pudo obtener la dirección del punto. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo al cargar el listado de fincas.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorListarFincas(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_LISTAR;
}

/**
 * Mensaje para un fallo al crear o editar una finca.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorGuardarFinca(status: number): string {
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
 * Mensaje para un fallo al eliminar una finca.
 *
 * El `409` indica que la finca tiene contratos vinculados y no puede eliminarse.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorEliminarFinca(status: number): string {
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

/**
 * Mensaje para un fallo al geocodificar una dirección.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorGeocodificacion(status: number): string {
  if (status === 404) {
    return MENSAJE_GEOCODIFICACION_NO_ENCONTRADA;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_GEOCODIFICACION_GENERICO;
}

/**
 * Mensaje para un fallo al obtener la dirección de un punto del mapa.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorGeocodificacionInversa(status: number): string {
  if (status === 404) {
    return MENSAJE_GEOCODIFICACION_INVERSA_NO_ENCONTRADA;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_GEOCODIFICACION_INVERSA_GENERICO;
}
