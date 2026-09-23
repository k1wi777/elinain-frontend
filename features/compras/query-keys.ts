import type { FiltrosCompras } from "@/features/compras/types";

/**
 * Fábrica de query keys de TanStack Query del feature `compras`.
 *
 * Centraliza las claves para que las consultas y las invalidaciones de las mutaciones
 * siempre coincidan. Sigue el patrón `['compras', 'list', filtros]`.
 */
export const clavesCompras = {
  /** Raíz de todas las consultas del feature. */
  todas: ["compras"] as const,
  /** Raíz de todas las listas, sin filtros; permite invalidarlas todas a la vez. */
  listas: () => ["compras", "list"] as const,
  /** Clave de una página concreta del listado filtrado por contrato. */
  lista: (filtros: FiltrosCompras) => ["compras", "list", filtros] as const,
};
