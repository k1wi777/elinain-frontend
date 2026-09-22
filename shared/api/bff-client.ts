import { createHttpClient, type HttpClient } from "@/shared/api/http-client";

/**
 * Crea el cliente HTTP para las llamadas del navegador al BFF del propio origen.
 *
 * A diferencia de `createServerClient` y `createPublicClient`, que apuntan al backend,
 * las rutas del BFF (`/api/auth/*`) viven en el mismo origen que la aplicación. Con la
 * base vacía, `buildUrl` produce rutas relativas que el navegador resuelve contra el
 * origen actual y a las que adjunta automáticamente la cookie httpOnly de sesión.
 *
 * No adjunta token: no lo conoce, y el navegador nunca debe acceder a él.
 */
export function createBffClient(): HttpClient {
  return createHttpClient({ baseUrl: "" });
}
