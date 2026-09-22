import axios, { type AxiosRequestConfig } from "axios";

import { toApiError } from "@/shared/api/errors";
import {
  buildAuthHeader,
  buildDefaultHeaders,
  buildUrl,
} from "@/shared/api/request";

/** Opciones para construir un cliente HTTP. */
export type HttpClientOptions = {
  /** URL base del backend; ya incluye el prefijo `/api/v1`. */
  baseUrl: string;
  /**
   * Obtiene el token de sesión antes de cada petición. Si no se define o devuelve
   * `undefined`, la petición se envía sin cabecera `Authorization`.
   */
  getAuthToken?: () => string | undefined | Promise<string | undefined>;
};

/**
 * Cliente HTTP tipado que devuelve directamente el cuerpo JSON de la respuesta, sin el
 * envoltorio de axios.
 */
export type HttpClient = {
  get<TResponse>(path: string, config?: AxiosRequestConfig): Promise<TResponse>;
  post<TResponse>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<TResponse>;
  put<TResponse>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<TResponse>;
  patch<TResponse>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<TResponse>;
  delete<TResponse>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<TResponse>;
};

/**
 * Crea un cliente HTTP isomorfo sobre axios.
 *
 * El núcleo no conoce `next/headers` ni el entorno: recibe la `baseUrl` y un
 * `getAuthToken` opcional, por lo que sirve tanto en servidor como en navegador.
 *
 * - Las peticiones llevan por defecto `Content-Type` y `Accept` JSON.
 * - La URL se compone con `buildUrl(baseUrl, path)`.
 * - El interceptor de respuesta convierte todo rechazo en un `ApiError`.
 */
export function createHttpClient({
  baseUrl,
  getAuthToken,
}: HttpClientOptions): HttpClient {
  const client = axios.create({ headers: buildDefaultHeaders() });

  client.interceptors.request.use(async (config) => {
    const token = await getAuthToken?.();

    config.url = buildUrl(baseUrl, config.url ?? "");

    if (token) {
      config.headers.set("Authorization", buildAuthHeader(token).Authorization);
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return {
    get: async <TResponse>(path: string, config?: AxiosRequestConfig) =>
      (await client.get<TResponse>(path, config)).data,
    post: async <TResponse>(
      path: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ) => (await client.post<TResponse>(path, data, config)).data,
    put: async <TResponse>(
      path: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ) => (await client.put<TResponse>(path, data, config)).data,
    patch: async <TResponse>(
      path: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ) => (await client.patch<TResponse>(path, data, config)).data,
    delete: async <TResponse>(path: string, config?: AxiosRequestConfig) =>
      (await client.delete<TResponse>(path, config)).data,
  };
}
