/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado de
 * `ApiError` con estos mensajes.
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_LISTAR =
  "No se pudo cargar el listado de compras. Inténtalo de nuevo.";

const MENSAJE_GUARDAR_DATOS = "Revisa los datos de la compra.";
const MENSAJE_GUARDAR_NO_EXISTE = "La compra no existe.";
const MENSAJE_GUARDAR_CON_VENTAS =
  "No se puede modificar la compra: el contrato ya tiene ventas registradas.";
const MENSAJE_GUARDAR_GENERICO =
  "No se pudo guardar la compra. Inténtalo de nuevo.";

const MENSAJE_ELIMINAR_CON_VENTAS =
  "No se puede eliminar la compra: el contrato ya tiene ventas registradas.";
const MENSAJE_ELIMINAR_NO_EXISTE = "La compra no existe.";
const MENSAJE_ELIMINAR_GENERICO =
  "No se pudo eliminar la compra. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo al cargar el listado de compras.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorListarCompras(status: number): string {
  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_LISTAR;
}

/**
 * Mensaje para un fallo al registrar o editar una compra.
 *
 * El `409` indica que el contrato ya tiene ventas registradas y la compra no puede
 * modificarse.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorGuardarCompra(status: number): string {
  if (status === 400) {
    return MENSAJE_GUARDAR_DATOS;
  }

  if (status === 404) {
    return MENSAJE_GUARDAR_NO_EXISTE;
  }

  if (status === 409) {
    return MENSAJE_GUARDAR_CON_VENTAS;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_GUARDAR_GENERICO;
}

/**
 * Mensaje para un fallo al eliminar una compra.
 *
 * El `409` indica que el contrato ya tiene ventas registradas y la compra no puede
 * eliminarse.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorEliminarCompra(status: number): string {
  if (status === 409) {
    return MENSAJE_ELIMINAR_CON_VENTAS;
  }

  if (status === 404) {
    return MENSAJE_ELIMINAR_NO_EXISTE;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_ELIMINAR_GENERICO;
}
