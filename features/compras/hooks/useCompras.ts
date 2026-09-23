"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { listarCompras } from "@/features/compras/api/compras";
import { clavesCompras } from "@/features/compras/query-keys";
import type { FiltrosCompras, PaginaCompras } from "@/features/compras/types";

/**
 * Consulta paginada de las compras de un contrato.
 *
 * `keepPreviousData` conserva la página anterior mientras llega la siguiente, evitando el
 * parpadeo al cambiar de página.
 */
export function useCompras(filtros: FiltrosCompras) {
  return useQuery<PaginaCompras, ApiError>({
    queryKey: clavesCompras.lista(filtros),
    queryFn: () => listarCompras(filtros),
    placeholderData: keepPreviousData,
  });
}
