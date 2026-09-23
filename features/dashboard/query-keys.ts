/**
 * Fábrica de query keys de TanStack Query del feature `dashboard`.
 *
 * Centraliza las claves para que las consultas coincidan con el patrón
 * `['dashboard', 'resumen']`. La vista solo realiza una consulta de lectura, sin
 * mutaciones que invaliden claves.
 */
export const clavesDashboard = {
  /** Raíz de todas las consultas del feature. */
  todas: ["dashboard"] as const,
  /** Clave del resumen consolidado del comerciante. */
  resumen: () => ["dashboard", "resumen"] as const,
};
