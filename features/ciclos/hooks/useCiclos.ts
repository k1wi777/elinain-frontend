"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { listarCiclos } from "@/features/ciclos/api/ciclos";
import { clavesCiclos } from "@/features/ciclos/query-keys";
import type { FiltrosCiclos, PaginaCiclos } from "@/features/ciclos/types";

/**
 * Consulta paginada de los ciclos de un contrato.
 *
 * `keepPreviousData` conserva la página anterior mientras llega la siguiente, evitando el
 * parpadeo al cambiar de página.
 */
export function useCiclos(filtros: FiltrosCiclos) {
  return useQuery<PaginaCiclos, ApiError>({
    queryKey: clavesCiclos.lista(filtros),
    queryFn: () => listarCiclos(filtros),
    placeholderData: keepPreviousData,
  });
}
