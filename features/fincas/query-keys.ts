import type { FiltrosFincas } from "@/features/fincas/types";

/**
 * Fábrica de query keys de TanStack Query del feature `fincas`.
 *
 * Centraliza las claves para que las consultas y las invalidaciones de las mutaciones
 * siempre coincidan. Sigue el patrón `['fincas', 'list', filtros]`.
 */
export const clavesFincas = {
  /** Raíz de todas las consultas del feature. */
  todas: ["fincas"] as const,
  /** Raíz de todas las listas, sin filtros; permite invalidarlas todas a la vez. */
  listas: () => ["fincas", "list"] as const,
  /** Clave de una página concreta del listado. */
  lista: (filtros: FiltrosFincas) => ["fincas", "list", filtros] as const,
  /** Clave del conjunto completo de pines del mapa. */
  mapa: () => ["fincas", "mapa"] as const,
  /** Clave del detalle de una finca concreta. */
  detalle: (id: string) => ["fincas", "detail", id] as const,
  /** Clave de las sugerencias de dirección para una consulta concreta. */
  sugerencias: (consulta: string) =>
    ["fincas", "geocodificacion", "sugerencias", consulta] as const,
};
