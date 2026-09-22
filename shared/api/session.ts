/**
 * Verificación de vigencia de la cookie de sesión a partir del JWT.
 *
 * Módulo puro y seguro para Edge (sin `node:*` ni `next/headers`), usado por el
 * `middleware.ts` y por el helper de cookie del BFF.
 *
 * No verifica la firma: el frontend no posee el secreto del backend. Esta comprobación es
 * una guardia de navegación, no un control de seguridad; el backend valida el token en
 * cada petición autenticada.
 */

/** Payload decodificado de un JWT, sin garantías sobre su contenido. */
type PayloadJwt = Record<string, unknown>;

/**
 * Decodifica el payload de un JWT (segunda parte, base64url) a un objeto.
 *
 * Devuelve `undefined` si el token no tiene forma de JWT, si la parte base64 no es
 * decodificable o si el contenido no es un objeto JSON.
 *
 * @param token JWT en formato `cabecera.payload.firma`.
 */
function decodificarPayload(token: string): PayloadJwt | undefined {
  const partes = token.split(".");
  const payloadBase64 = partes[1];

  if (payloadBase64 === undefined || payloadBase64 === "") {
    return undefined;
  }

  try {
    const normalizado = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const relleno = normalizado.padEnd(
      Math.ceil(normalizado.length / 4) * 4,
      "=",
    );
    const contenido: unknown = JSON.parse(atob(relleno));

    if (
      typeof contenido !== "object" ||
      contenido === null ||
      Array.isArray(contenido)
    ) {
      return undefined;
    }

    return contenido as PayloadJwt;
  } catch {
    return undefined;
  }
}

/**
 * Obtiene la marca de expiración (`exp`) declarada en el JWT, en segundos epoch.
 *
 * Devuelve `undefined` si el token está malformado o si no declara `exp`.
 *
 * @param token JWT de acceso.
 */
export function obtenerExpiracionJwt(token: string): number | undefined {
  const payload = decodificarPayload(token);
  const exp = payload?.exp;

  return typeof exp === "number" ? exp : undefined;
}

/**
 * Indica si la sesión representada por el token sigue vigente.
 *
 * - Sin token o con token en blanco: no vigente.
 * - Token malformado: no vigente.
 * - Token válido sin `exp`: vigente (la autoridad real es el backend).
 * - Token válido con `exp`: vigente mientras `exp` no haya pasado.
 *
 * @param token Valor de la cookie de sesión, si existe.
 * @param ahoraMs Instante de referencia en milisegundos; por defecto `Date.now()`.
 */
export function sesionVigente(
  token: string | undefined,
  ahoraMs: number = Date.now(),
): boolean {
  if (token === undefined || token.trim() === "") {
    return false;
  }

  const payload = decodificarPayload(token);

  if (payload === undefined) {
    return false;
  }

  const exp = payload.exp;

  if (typeof exp !== "number") {
    return true;
  }

  return exp * 1000 > ahoraMs;
}
