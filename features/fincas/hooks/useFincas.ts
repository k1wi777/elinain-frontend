"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { listarFincas } from "@/features/fincas/api/fincas";
import { clavesFincas } from "@/features/fincas/query-keys";
import type { FiltrosFincas, PaginaFincas } from "@/features/fincas/types";

/**
 * Consulta paginada del listado de fincas.
 *
 * `keepPreviousData` conserva la página anterior mientras llega la siguiente, evitando el
 * parpadeo al cambiar de página.
 */
export function useFincas(filtros: FiltrosFincas) {
  return useQuery<PaginaFincas, ApiError>({
    queryKey: clavesFincas.lista(filtros),
    queryFn: () => listarFincas(filtros),
    placeholderData: keepPreviousData,
  });
}
