"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { listarTodasLasFincas } from "@/features/fincas/api/fincas";
import { clavesFincas } from "@/features/fincas/query-keys";
import type { Finca } from "@/features/fincas/types";

/**
 * Consulta del conjunto completo de fincas para el mapa.
 *
 * A diferencia del listado paginado, devuelve todas las fincas del comerciante en una
 * única colección que alimenta un pin por finca.
 */
export function useTodasLasFincas() {
  return useQuery<Finca[], ApiError>({
    queryKey: clavesFincas.mapa(),
    queryFn: listarTodasLasFincas,
  });
}
