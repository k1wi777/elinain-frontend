/**
 * Fábrica de query keys de TanStack Query del feature `reportes`.
 *
 * Centraliza las claves para que las consultas coincidan con el patrón
 * `['reportes', '<vista>']`. Las dos vistas son operaciones de solo lectura, sin
 * mutaciones que invaliden claves.
 */
export const clavesReportes = {
  /** Raíz de todas las consultas del feature. */
  todas: ["reportes"] as const,
  /** Clave del reporte de contratos activos. */
  contratosActivos: () => ["reportes", "contratos-activos"] as const,
  /** Clave del historial de ventas. */
  historialVentas: () => ["reportes", "historial-ventas"] as const,
};
