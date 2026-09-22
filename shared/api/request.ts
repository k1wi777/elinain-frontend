/**
 * Helpers puros de construcción de peticiones.
 *
 * No conocen axios ni el entorno: reciben sus entradas y devuelven valores, por lo que
 * son reutilizables y testeables sin red.
 */

/** Cabeceras HTTP expresadas como pares clave-valor. */
export type RequestHeaders = Record<string, string>;

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i;

/**
 * Indica si una ruta es una URL absoluta con esquema (por ejemplo `https://…`).
 */
function isAbsoluteUrl(path: string): boolean {
  return ABSOLUTE_URL_PATTERN.test(path);
}

/**
 * Cabeceras comunes a todas las peticiones: cuerpo y respuesta en JSON.
 */
export function buildDefaultHeaders(): RequestHeaders {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Cabecera de autorización para el token de sesión.
 *
 * @param token JWT de acceso obtenido de la cookie httpOnly.
 */
export function buildAuthHeader(token: string): RequestHeaders {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Une la URL base con la ruta relativa del recurso usando una única barra.
 *
 * Deja pasar sin modificaciones las URLs absolutas y devuelve la base cuando la ruta
 * está vacía.
 *
 * @param baseUrl URL base del backend (ya incluye el prefijo `/api/v1`).
 * @param path Ruta relativa del recurso, por ejemplo `/terceros`.
 */
export function buildUrl(baseUrl: string, path: string): string {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  if (normalizedPath === "") {
    return normalizedBase;
  }

  return `${normalizedBase}/${normalizedPath}`;
}
