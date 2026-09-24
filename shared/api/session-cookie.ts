import { obtenerExpiracionJwt } from "@/shared/api/session";
import { getServerEnv } from "@/shared/config/env";

/**
 * Nombres de las cookies httpOnly de la sesión.
 *
 * Se exponen como constantes para que el BFF, el middleware y el cliente HTTP base
 * escriban y lean las cookies con el mismo nombre, sin cadenas literales duplicadas.
 *
 * `SESSION_COOKIE_NAME` almacena el JWT de acceso; `REFRESH_COOKIE_NAME` el token de
 * refresco opaco con el que se renueva la sesión.
 */
export const SESSION_COOKIE_NAME = "elinain_session";
export const REFRESH_COOKIE_NAME = "elinain_refresh";

/** Par de tokens que conforman la sesión renovable. */
export type TokensSesion = {
  tokenAcceso: string;
  tokenRefresco: string;
};

/**
 * Opciones de escritura de una cookie de sesión.
 *
 * El tipo es compatible tanto con `response.cookies.set(...)` como con
 * `cookies().set(...)`, de modo que las mismas opciones sirven en el BFF y en el
 * middleware.
 */
export type OpcionesCookieSesion = {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge?: number;
};

/**
 * Atributos comunes de las cookies de sesión.
 *
 * El token nunca es legible por JavaScript (`httpOnly`), solo viaja por HTTPS en
 * producción (`secure`) y su alcance es todo el sitio para que el BFF, los Server
 * Components y el middleware puedan leerla.
 */
function atributosCookie(): OpcionesCookieSesion {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: getServerEnv().isProduction,
    path: "/",
  };
}

/**
 * Opciones de la cookie que almacena el token de acceso.
 *
 * Cuando el JWT declara `exp`, la cookie caduca al mismo tiempo que el token; si no lo
 * declara, se emite como cookie de sesión (sin `maxAge`) sin inventar una duración.
 *
 * @param tokenAcceso JWT devuelto por el backend.
 */
export function opcionesCookieAcceso(
  tokenAcceso: string,
): OpcionesCookieSesion {
  const expiracion = obtenerExpiracionJwt(tokenAcceso);

  if (expiracion === undefined) {
    return atributosCookie();
  }

  const maxAge = Math.max(0, expiracion - Math.floor(Date.now() / 1000));

  return { ...atributosCookie(), maxAge };
}

/**
 * Opciones de la cookie que almacena el token de refresco.
 *
 * El contrato no expone la vigencia del token opaco, por lo que se emite como cookie de
 * sesión (sin `maxAge`).
 */
export function opcionesCookieRefresco(): OpcionesCookieSesion {
  return atributosCookie();
}

/** Opciones para eliminar una cookie de sesión en el navegador. */
export function opcionesCookieExpirada(): OpcionesCookieSesion {
  return { ...atributosCookie(), maxAge: 0 };
}
