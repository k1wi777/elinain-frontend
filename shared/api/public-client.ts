import { createHttpClient, type HttpClient } from "@/shared/api/http-client";
import { getClientEnv } from "@/shared/config/env";

/**
 * Crea el cliente HTTP para endpoints públicos, seguro de usar en el navegador.
 *
 * Usa `NEXT_PUBLIC_API_URL` y nunca adjunta el token de sesión.
 */
export function createPublicClient(): HttpClient {
  const { apiUrl } = getClientEnv();

  return createHttpClient({ baseUrl: apiUrl });
}
