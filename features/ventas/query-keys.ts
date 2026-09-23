import type { FiltrosVentas } from "@/features/ventas/types";

/**
 * Fábrica de query keys de TanStack Query del feature `ventas`.
 *
 * Centraliza las claves para que las consultas y las invalidaciones de las mutaciones
 * siempre coincidan. Sigue el patrón `['ventas', 'list', filtros]`.
 */
export const clavesVentas = {
  /** Raíz de todas las consultas del feature. */
  todas: ["ventas"] as const,
  /** Raíz de todas las listas, sin filtros; permite invalidarlas todas a la vez. */
  listas: () => ["ventas", "list"] as const,
  /** Clave de una página concreta del listado, filtrado por contrato o global. */
  lista: (filtros: FiltrosVentas) => ["ventas", "list", filtros] as const,
};
