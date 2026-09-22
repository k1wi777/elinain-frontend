import { cookies } from "next/headers";

import { createHttpClient, type HttpClient } from "@/shared/api/http-client";
import { SESSION_COOKIE_NAME } from "@/shared/api/session-cookie";
import { getServerEnv } from "@/shared/config/env";

/**
 * Crea el cliente HTTP autenticado para uso exclusivo en servidor (BFF, Server Components
 * y Server Actions).
 *
 * Lee el token de la cookie httpOnly de sesión y lo adjunta como `Authorization: Bearer`
 * en cada petición. Si la cookie no existe, la petición se ejecuta sin cabecera de
 * autorización y sin lanzar un error propio: la decisión de autorización queda en el
 * backend.
 *
 * Importa `next/headers`, por lo que es server-only: un import accidental desde el
 * cliente falla en build.
 */
export async function createServerClient(): Promise<HttpClient> {
  const cookieStore = await cookies();
  const { apiUrl } = getServerEnv();

  return createHttpClient({
    baseUrl: apiUrl,
    getAuthToken: () => cookieStore.get(SESSION_COOKIE_NAME)?.value,
  });
}
