import type { FiltrosTerceros } from "@/features/terceros/types";

/**
 * Fábrica de query keys de TanStack Query del feature `terceros`.
 *
 * Centraliza las claves para que las consultas y las invalidaciones de las mutaciones
 * siempre coincidan. Sigue el patrón `['terceros', 'list', filtros]`.
 */
export const clavesTerceros = {
  /** Raíz de todas las consultas del feature. */
  todas: ["terceros"] as const,
  /** Raíz de todas las listas, sin filtros; permite invalidarlas todas a la vez. */
  listas: () => ["terceros", "list"] as const,
  /** Clave de una página concreta del listado. */
  lista: (filtros: FiltrosTerceros) => ["terceros", "list", filtros] as const,
};
