"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { listarCostos } from "@/features/costos/api/costos";
import { clavesCostos } from "@/features/costos/query-keys";
import type { FiltrosCostos, PaginaCostos } from "@/features/costos/types";

/**
 * Consulta paginada de los costos de un contrato.
 *
 * `keepPreviousData` conserva la página anterior mientras llega la siguiente, evitando el
 * parpadeo al cambiar de página.
 */
export function useCostos(filtros: FiltrosCostos) {
  return useQuery<PaginaCostos, ApiError>({
    queryKey: clavesCostos.lista(filtros),
    queryFn: () => listarCostos(filtros),
    placeholderData: keepPreviousData,
  });
}
