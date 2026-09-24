import type { NextResponse } from "next/server";

import {
  opcionesCookieAcceso,
  opcionesCookieExpirada,
  opcionesCookieRefresco,
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  type TokensSesion,
} from "@/shared/api/session-cookie";

/**
 * Guarda el par de tokens de la sesión en cookies httpOnly.
 *
 * El acceso se emite con `maxAge` acorde a su `exp`; el refresco, como cookie de sesión
 * porque su vigencia es opaca. Los tokens nunca se exponen en el cuerpo de la respuesta.
 *
 * @param response Respuesta del BFF sobre la que se escriben las cookies.
 * @param tokens Par de tokens devuelto por el backend.
 */
export function fijarSesion(
  response: NextResponse,
  tokens: TokensSesion,
): void {
  response.cookies.set(
    SESSION_COOKIE_NAME,
    tokens.tokenAcceso,
    opcionesCookieAcceso(tokens.tokenAcceso),
  );
  response.cookies.set(
    REFRESH_COOKIE_NAME,
    tokens.tokenRefresco,
    opcionesCookieRefresco(),
  );
}

/**
 * Elimina las cookies de acceso y de refresco para cerrar la sesión en el navegador.
 *
 * @param response Respuesta del BFF sobre la que se limpia la sesión.
 */
export function limpiarSesion(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", opcionesCookieExpirada());
  response.cookies.set(REFRESH_COOKIE_NAME, "", opcionesCookieExpirada());
}
