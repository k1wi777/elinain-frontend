/**
 * Único punto de lectura tipada de `process.env`.
 *
 * - `getClientEnv()`: variables `NEXT_PUBLIC_*`, seguras para el navegador.
 * - `getServerEnv()`: variables de servidor (`API_URL`), solo disponibles en el BFF
 *   (`app/api/*`) y en código de servidor. Nunca debe invocarse desde el cliente.
 *
 * Se usan funciones en lugar de constantes evaluadas al importar el módulo para que un
 * módulo de cliente pueda importar `getClientEnv` sin evaluar `getServerEnv`.
 */

export type Env = {
  /** URL base de la API del backend; incluye el prefijo `/api/v1`. */
  apiUrl: string;
  /** Indica si el código corre en un entorno de producción (`NODE_ENV`). */
  isProduction: boolean;
};

/**
 * Devuelve el valor de una variable de entorno obligatoria.
 *
 * @param name Nombre de la variable, usado en el mensaje de error.
 * @param value Valor crudo leído de `process.env`.
 * @throws Si el valor es `undefined` o una cadena vacía.
 */
export function readRequiredEnv(
  name: string,
  value: string | undefined,
): string {
  if (value === undefined || value.trim() === "") {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

/**
 * Entorno disponible en el cliente: solo variables `NEXT_PUBLIC_*`.
 */
export function getClientEnv(): Env {
  return {
    apiUrl: readRequiredEnv(
      "NEXT_PUBLIC_API_URL",
      process.env.NEXT_PUBLIC_API_URL,
    ),
    isProduction: process.env.NODE_ENV === "production",
  };
}

/**
 * Entorno disponible en el servidor: variables no expuestas al navegador.
 */
export function getServerEnv(): Env {
  return {
    apiUrl: readRequiredEnv("API_URL", process.env.API_URL),
    isProduction: process.env.NODE_ENV === "production",
  };
}
