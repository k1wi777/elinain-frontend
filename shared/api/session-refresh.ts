import type { AxiosRequestConfig } from "axios";

import { ApiError } from "@/shared/api/errors";
import type { HttpClient } from "@/shared/api/http-client";
import { esSesionInvalida } from "@/shared/api/session-renovacion";

/**
 * Wrapper de refresco reactivo del cliente HTTP.
 *
 * Módulo puro (sin `next/headers`): recibe el cliente a envolver, la función que renueva
 * la sesión y las rutas excluidas. Ante un `401` en una ruta no excluida, renueva la
 * sesión y reintenta una única vez la operación original.
 */
export function crearClienteConRefresco(
  cliente: HttpClient,
  renovarSesion: () => Promise<void>,
  rutasSinRefresco: readonly string[],
): HttpClient {
  const excluidas = new Set(rutasSinRefresco);

  /**
   * Ejecuta `operacion` y, si falla con un `401` en una ruta no excluida, renueva la
   * sesión y la reintenta una sola vez.
   */
  async function conRefresco<TResponse>(
    ruta: string,
    operacion: () => Promise<TResponse>,
  ): Promise<TResponse> {
    try {
      return await operacion();
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 401 ||
        excluidas.has(ruta)
      ) {
        throw error;
      }

      try {
        await renovarSesion();
      } catch (errorRenovacion) {
        if (
          errorRenovacion instanceof ApiError &&
          esSesionInvalida(errorRenovacion.status)
        ) {
          throw error;
        }

        throw errorRenovacion;
      }

      return operacion();
    }
  }

  return {
    get: <TResponse>(path: string, config?: AxiosRequestConfig) =>
      conRefresco(path, () => cliente.get<TResponse>(path, config)),
    post: <TResponse>(
      path: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ) => conRefresco(path, () => cliente.post<TResponse>(path, data, config)),
    put: <TResponse>(
      path: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ) => conRefresco(path, () => cliente.put<TResponse>(path, data, config)),
    patch: <TResponse>(
      path: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ) => conRefresco(path, () => cliente.patch<TResponse>(path, data, config)),
    delete: <TResponse>(path: string, config?: AxiosRequestConfig) =>
      conRefresco(path, () => cliente.delete<TResponse>(path, config)),
  };
}
