import type { NextResponse } from "next/server";

import { obtenerExpiracionJwt } from "@/shared/api/session";
import { SESSION_COOKIE_NAME } from "@/shared/api/session-cookie";
import { getServerEnv } from "@/shared/config/env";

/**
 * Atributos comunes de la cookie de sesión.
 *
 * El token nunca es legible por JavaScript (`httpOnly`), solo viaja por HTTPS en
 * producción (`secure`) y su alcance es todo el sitio para que el BFF y los Server
 * Components puedan leerla.
 */
function atributosCookie() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: getServerEnv().isProduction,
    path: "/",
  };
}

/**
 * Guarda el token de acceso en la cookie httpOnly de sesión.
 *
 * Cuando el JWT declara `exp`, la cookie caduca al mismo tiempo que el token; si no lo
 * declara, se emite como cookie de sesión (sin `maxAge`) sin inventar una duración.
 *
 * @param response Respuesta del BFF sobre la que se escribe la cookie.
 * @param tokenAcceso JWT devuelto por el backend.
 */
export function fijarSesion(response: NextResponse, tokenAcceso: string): void {
  const expiracion = obtenerExpiracionJwt(tokenAcceso);

  if (expiracion === undefined) {
    response.cookies.set(SESSION_COOKIE_NAME, tokenAcceso, atributosCookie());
    return;
  }

  const maxAge = Math.max(0, expiracion - Math.floor(Date.now() / 1000));

  response.cookies.set(SESSION_COOKIE_NAME, tokenAcceso, {
    ...atributosCookie(),
    maxAge,
  });
}

/**
 * Elimina la cookie de sesión para cerrar la sesión en el navegador.
 *
 * @param response Respuesta del BFF sobre la que se limpia la cookie.
 */
export function limpiarSesion(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...atributosCookie(),
    maxAge: 0,
  });
}
