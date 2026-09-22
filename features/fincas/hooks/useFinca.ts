"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { obtenerFinca } from "@/features/fincas/api/fincas";
import { clavesFincas } from "@/features/fincas/query-keys";
import type { Finca } from "@/features/fincas/types";

/**
 * Consulta del detalle de una finca concreta.
 *
 * La consulta solo se habilita cuando hay un identificador, para no pedir una finca vacía
 * al montar la vista de edición.
 */
export function useFinca(id: string) {
  return useQuery<Finca, ApiError>({
    queryKey: clavesFincas.detalle(id),
    queryFn: () => obtenerFinca(id),
    enabled: id !== "",
  });
}
