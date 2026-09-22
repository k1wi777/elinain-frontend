import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compone clases de Tailwind resolviendo los conflictos entre utilidades.
 *
 * Acepta strings, arrays, objetos condicionales y valores anidados (comportamiento de
 * `clsx`) y, sobre el resultado, aplica `tailwind-merge` para que la última utilidad de
 * cada grupo gane. Evita concatenaciones largas con ternarios en el JSX.
 *
 * @param clases Clases condicionales a componer.
 * @returns La cadena de clases resultante, sin conflictos entre utilidades.
 */
export function cn(...clases: ClassValue[]): string {
  return twMerge(clsx(clases));
}
