import { ApiError, mapErrorResponse } from "@/shared/api/errors";
import { buildUrl } from "@/shared/api/request";
import { desenvolverRespuesta } from "@/shared/api/response";
import type { TokensSesion } from "@/shared/api/session-cookie";

/**
 * Ejecutor de la renovación de sesión (`POST /usuarios/refresh`) con `fetch` nativo.
 *
 * Módulo seguro para Edge (sin `next/headers` ni `node:*`): el middleware lo usa con el
 * `fetch` global del runtime y el BFF puede reutilizarlo inyectando su propia instancia.
 */

/** Códigos del backend que indican un rechazo definitivo del token de refresco. */
const ESTADOS_SESION_INVALIDA = new Set([400, 401]);

/**
 * Indica si un estado HTTP corresponde a un rechazo definitivo del token de refresco.
 *
 * Un rechazo definitivo significa que el refresco ya no sirve y la sesión local debe
 * eliminarse; cualquier otro fallo (red o `5xx`) es transitorio.
 *
 * @param status Código HTTP devuelto por el backend.
 */
export function esSesionInvalida(status: number): boolean {
  return ESTADOS_SESION_INVALIDA.has(status);
}

/**
 * Lee el par de tokens del payload de una renovación.
 *
 * Devuelve `undefined` si el cuerpo no es un objeto o si alguno de los tokens no es una
 * cadena no vacía; ese caso se trata como transitorio (respuesta malformada).
 */
function leerTokens(datos: unknown): TokensSesion | undefined {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    return undefined;
  }

  const { tokenAcceso, tokenRefresco } = datos as Record<string, unknown>;

  if (typeof tokenAcceso !== "string" || tokenAcceso === "") {
    return undefined;
  }

  if (typeof tokenRefresco !== "string" || tokenRefresco === "") {
    return undefined;
  }

  return { tokenAcceso, tokenRefresco };
}

/**
 * Construye el ejecutor de la renovación.
 *
 * @param obtenerBaseUrl Devuelve la URL base del backend; se resuelve por llamada para no
 * evaluar el entorno al importar el módulo.
 * @param fetchFn Implementación de `fetch` a usar; por defecto el `fetch` global.
 * @returns Función que renueva la sesión a partir del token de refresco.
 */
export function crearRenovadorConFetch(
  obtenerBaseUrl: () => string,
  fetchFn: typeof fetch = fetch,
): (tokenRefresco: string) => Promise<TokensSesion> {
  return async (tokenRefresco: string): Promise<TokensSesion> => {
    const url = buildUrl(obtenerBaseUrl(), "/usuarios/refresh");

    let respuesta: Response;

    try {
      respuesta = await fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ tokenRefresco }),
      });
    } catch {
      throw new ApiError(0, "No se pudo conectar con el servidor al renovar.");
    }

    let cuerpo: unknown;

    try {
      cuerpo = await respuesta.json();
    } catch {
      cuerpo = undefined;
    }

    if (!respuesta.ok) {
      throw mapErrorResponse(respuesta.status, cuerpo);
    }

    const tokens = leerTokens(desenvolverRespuesta(cuerpo));

    if (tokens === undefined) {
      throw new ApiError(500, "Respuesta de renovación inválida.");
    }

    return tokens;
  };
}
