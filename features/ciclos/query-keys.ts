import type { FiltrosCiclos } from "@/features/ciclos/types";

/**
 * Fábrica de query keys de TanStack Query del feature `ciclos`.
 *
 * Centraliza las claves para que las consultas y las invalidaciones de las mutaciones
 * siempre coincidan. Sigue el patrón `['ciclos', 'list', filtros]`.
 */
export const clavesCiclos = {
  /** Raíz de todas las consultas del feature. */
  todas: ["ciclos"] as const,
  /** Raíz de todas las listas, sin filtros; permite invalidarlas todas a la vez. */
  listas: () => ["ciclos", "list"] as const,
  /** Clave de una página concreta del listado filtrado por contrato. */
  lista: (filtros: FiltrosCiclos) => ["ciclos", "list", filtros] as const,
};
