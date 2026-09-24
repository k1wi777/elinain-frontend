import { cookies } from "next/headers";

import { ApiError } from "@/shared/api/errors";
import { createHttpClient, type HttpClient } from "@/shared/api/http-client";
import { crearCoordinadorRefresco } from "@/shared/api/refresh-coordinator";
import {
  opcionesCookieAcceso,
  opcionesCookieExpirada,
  opcionesCookieRefresco,
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  type TokensSesion,
} from "@/shared/api/session-cookie";
import { crearClienteConRefresco } from "@/shared/api/session-refresh";
import {
  crearRenovadorConFetch,
  esSesionInvalida,
} from "@/shared/api/session-renovacion";
import { getServerEnv } from "@/shared/config/env";

/**
 * Rutas del BFF que no deben disparar la renovación reactiva: son las propias del ciclo
 * de autenticación (acceso, registro, refresco y cierre de sesión).
 */
const RUTAS_SIN_REFRESCO = [
  "/usuarios/acceso",
  "/usuarios/registro",
  "/usuarios/refresh",
  "/usuarios/logout",
] as const;

/**
 * Coordinador single-flight a nivel de módulo: comparte una única renovación entre las
 * peticiones concurrentes del proceso. La base URL se resuelve de forma diferida para no
 * evaluar el entorno al importar el módulo.
 */
const coordinarRefresco = crearCoordinadorRefresco(
  crearRenovadorConFetch(() => getServerEnv().apiUrl),
);

/**
 * Crea un cliente HTTP sin autenticación, para las operaciones que no llevan sesión (por
 * ejemplo, la revocación del token de refresco en el cierre de sesión).
 */
export function createServerAnonClient(): HttpClient {
  return createHttpClient({ baseUrl: getServerEnv().apiUrl });
}

/**
 * Crea el cliente HTTP autenticado para uso exclusivo en servidor (BFF, Server Components
 * y Server Actions).
 *
 * Lee el token de las cookies httpOnly de acceso y de refresco. Ante un `401` por token
 * de acceso expirado, renueva la sesión con el token de refresco, actualiza las cookies
 * (rotación) y reintenta una única vez la operación original; si el refresco se rechaza
 * de forma definitiva, limpia la sesión. Un fallo transitorio no cierra la sesión y se
 * propaga el error real.
 *
 * Importa `next/headers`, por lo que es server-only: un import accidental desde el
 * cliente falla en build.
 */
export async function createServerClient(): Promise<HttpClient> {
  const cookieStore = await cookies();
  const { apiUrl } = getServerEnv();

  let tokenAcceso = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  /** Escribe ambas cookies con el par de tokens renovado. */
  function escribirCookies(tokens: TokensSesion): void {
    cookieStore.set(
      SESSION_COOKIE_NAME,
      tokens.tokenAcceso,
      opcionesCookieAcceso(tokens.tokenAcceso),
    );
    cookieStore.set(
      REFRESH_COOKIE_NAME,
      tokens.tokenRefresco,
      opcionesCookieRefresco(),
    );
  }

  /** Elimina ambas cookies de sesión. */
  function expirarCookies(): void {
    cookieStore.set(SESSION_COOKIE_NAME, "", opcionesCookieExpirada());
    cookieStore.set(REFRESH_COOKIE_NAME, "", opcionesCookieExpirada());
  }

  /**
   * Renueva la sesión con el token de refresco. En éxito actualiza las cookies; ante un
   * rechazo definitivo las limpia. En ambos casos propaga el resultado.
   */
  async function renovarSesion(): Promise<void> {
    const tokenRefresco = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

    if (tokenRefresco === undefined || tokenRefresco === "") {
      throw new ApiError(
        401,
        "No hay token de refresco para renovar la sesión.",
      );
    }

    let tokens: TokensSesion;

    try {
      tokens = await coordinarRefresco(tokenRefresco);
    } catch (error) {
      if (error instanceof ApiError && esSesionInvalida(error.status)) {
        expirarCookies();
      }

      throw error;
    }

    tokenAcceso = tokens.tokenAcceso;
    escribirCookies(tokens);
  }

  const cliente = createHttpClient({
    baseUrl: apiUrl,
    getAuthToken: () => tokenAcceso,
  });

  return crearClienteConRefresco(cliente, renovarSesion, RUTAS_SIN_REFRESCO);
}
