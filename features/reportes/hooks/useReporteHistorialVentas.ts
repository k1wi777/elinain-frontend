"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { obtenerReporteHistorialVentas } from "@/features/reportes/api/reportes";
import { clavesReportes } from "@/features/reportes/query-keys";
import type { ReporteHistorialVentas } from "@/features/reportes/types";

/**
 * Consulta del historial de ventas del comerciante.
 *
 * Es una operación de solo lectura: no hay mutaciones ni invalidación de claves.
 */
export function useReporteHistorialVentas() {
  return useQuery<ReporteHistorialVentas, ApiError>({
    queryKey: clavesReportes.historialVentas(),
    queryFn: obtenerReporteHistorialVentas,
  });
}
