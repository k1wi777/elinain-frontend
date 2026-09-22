/**
 * Traducción del estado HTTP a un mensaje controlado en español.
 *
 * La interfaz nunca muestra el mensaje crudo del backend: reacciona al código de estado
 * de `ApiError` con estos mensajes (R14, R17, R21, R23, R35).
 */

const MENSAJE_CONEXION =
  "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

const MENSAJE_ACCESO_INCORRECTO = "Correo o contraseña incorrectos.";
const MENSAJE_ACCESO_GENERICO =
  "No se pudo iniciar sesión. Inténtalo de nuevo.";

const MENSAJE_REGISTRO_CONFLICTO = "Este correo ya está registrado.";
const MENSAJE_REGISTRO_DATOS =
  "Revisa los datos del formulario e inténtalo de nuevo.";
const MENSAJE_REGISTRO_GENERICO =
  "No se pudo completar el registro. Inténtalo de nuevo.";

/**
 * Mensaje para un fallo del formulario de acceso.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorAcceso(status: number): string {
  if (status === 401) {
    return MENSAJE_ACCESO_INCORRECTO;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_ACCESO_GENERICO;
}

/**
 * Mensaje para un fallo del formulario de registro.
 *
 * @param status Código HTTP del fallo; `0` indica fallo de conexión.
 */
export function mensajeErrorRegistro(status: number): string {
  if (status === 409) {
    return MENSAJE_REGISTRO_CONFLICTO;
  }

  if (status === 400) {
    return MENSAJE_REGISTRO_DATOS;
  }

  if (status === 0) {
    return MENSAJE_CONEXION;
  }

  return MENSAJE_REGISTRO_GENERICO;
}
