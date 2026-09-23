import type { FiltrosCostos } from "@/features/costos/types";

/**
 * Fábrica de query keys de TanStack Query del feature `costos`.
 *
 * Centraliza las claves para que las consultas y las invalidaciones de las mutaciones
 * siempre coincidan. Sigue el patrón `['costos', 'list', filtros]`.
 */
export const clavesCostos = {
  /** Raíz de todas las consultas del feature. */
  todas: ["costos"] as const,
  /** Raíz de todas las listas, sin filtros; permite invalidarlas todas a la vez. */
  listas: () => ["costos", "list"] as const,
  /** Clave de una página concreta del listado filtrado por contrato. */
  lista: (filtros: FiltrosCostos) => ["costos", "list", filtros] as const,
};
