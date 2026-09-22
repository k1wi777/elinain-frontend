"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { listarTerceros } from "@/features/terceros/api/terceros";
import { clavesTerceros } from "@/features/terceros/query-keys";
import type {
  FiltrosTerceros,
  PaginaTerceros,
} from "@/features/terceros/types";

/**
 * Consulta paginada del listado de terceros.
 *
 * `keepPreviousData` conserva la página anterior mientras llega la siguiente, evitando el
 * parpadeo al cambiar de página.
 */
export function useTerceros(filtros: FiltrosTerceros) {
  return useQuery<PaginaTerceros, ApiError>({
    queryKey: clavesTerceros.lista(filtros),
    queryFn: () => listarTerceros(filtros),
    placeholderData: keepPreviousData,
  });
}
