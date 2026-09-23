"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { listarVentas } from "@/features/ventas/api/ventas";
import { clavesVentas } from "@/features/ventas/query-keys";
import type { FiltrosVentas, PaginaVentas } from "@/features/ventas/types";

/**
 * Consulta paginada de las ventas, opcionalmente filtradas por contrato.
 *
 * `keepPreviousData` conserva la página anterior mientras llega la siguiente, evitando el
 * parpadeo al cambiar de página o de filtro.
 */
export function useVentas(filtros: FiltrosVentas) {
  return useQuery<PaginaVentas, ApiError>({
    queryKey: clavesVentas.lista(filtros),
    queryFn: () => listarVentas(filtros),
    placeholderData: keepPreviousData,
  });
}
