"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { obtenerReporteDashboard } from "@/features/dashboard/api/dashboard";
import { clavesDashboard } from "@/features/dashboard/query-keys";
import type { ReporteDashboard } from "@/features/dashboard/types";

/**
 * Consulta del resumen consolidado del dashboard.
 *
 * Es una operación de solo lectura: no hay mutaciones ni invalidación de claves.
 */
export function useReporteDashboard() {
  return useQuery<ReporteDashboard, ApiError>({
    queryKey: clavesDashboard.resumen(),
    queryFn: obtenerReporteDashboard,
  });
}
