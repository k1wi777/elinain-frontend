"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { obtenerReporteContratosActivos } from "@/features/reportes/api/reportes";
import { clavesReportes } from "@/features/reportes/query-keys";
import type { ReporteContratosActivos } from "@/features/reportes/types";

/**
 * Consulta del reporte de contratos activos del comerciante.
 *
 * Es una operación de solo lectura: no hay mutaciones ni invalidación de claves.
 */
export function useReporteContratosActivos() {
  return useQuery<ReporteContratosActivos, ApiError>({
    queryKey: clavesReportes.contratosActivos(),
    queryFn: obtenerReporteContratosActivos,
  });
}
