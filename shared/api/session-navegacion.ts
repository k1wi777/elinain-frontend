import { obtenerExpiracionJwt, sesionVigente } from "@/shared/api/session";

/**
 * Decisión de navegación del middleware ante una ruta protegida.
 *
 * Módulo puro y seguro para Edge (sin `next/headers` ni `node:*`): no conoce Next, por lo
 * que se prueba con Jest sin red ni render.
 */

/** Margen de holgura con el que se anticipa la renovación proactiva del acceso. */
export const MARGEN_RENOVACION_MS = 60_000;

/** Acción que debe tomar el middleware tras evaluar la sesión. */
export type DecisionNavegacion = "continuar" | "renovar" | "redirigir-login";

/**
 * Decide si la navegación puede continuar, requiere renovar la sesión o debe redirigir al
 * login.
 *
 * - Acceso con más de `margenMs` de holgura → `"continuar"`.
 * - Acceso vencido, ausente o con `margenMs` o menos antes de su `exp`:
 *   - con token de refresco → `"renovar"`;
 *   - sin token de refresco → `"redirigir-login"`.
 * - JWT decodificable sin `exp` legible → `"continuar"`: la autoridad real es el backend.
 * - Token ausente o malformado → no es utilizable: renueva o redirige según el refresco.
 *
 * @param tokenAcceso Valor de la cookie de acceso, si existe.
 * @param hayTokenRefresco Indica si existe cookie de refresco.
 * @param ahoraMs Instante de referencia en milisegundos; por defecto `Date.now()`.
 * @param margenMs Margen de holgura en milisegundos; por defecto `MARGEN_RENOVACION_MS`.
 */
export function decidirNavegacionSesion(
  tokenAcceso: string | undefined,
  hayTokenRefresco: boolean,
  ahoraMs: number = Date.now(),
  margenMs: number = MARGEN_RENOVACION_MS,
): DecisionNavegacion {
  const expiracion =
    tokenAcceso === undefined ? undefined : obtenerExpiracionJwt(tokenAcceso);

  if (expiracion !== undefined && expiracion * 1000 - ahoraMs > margenMs) {
    return "continuar";
  }

  if (expiracion === undefined && sesionVigente(tokenAcceso, ahoraMs)) {
    return "continuar";
  }

  return hayTokenRefresco ? "renovar" : "redirigir-login";
}
