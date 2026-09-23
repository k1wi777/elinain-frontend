import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import type { ReporteDashboard } from "@/features/dashboard/types";

/**
 * Acceso a los reportes del dashboard a través del BFF.
 *
 * Delega en `createBffClient` (mismo origen, con la cookie httpOnly adjunta por el
 * navegador) y propaga el `ApiError` que produzca el cliente HTTP. Los componentes nunca
 * conocen las URLs ni llaman a `fetch`.
 */

/**
 * Obtiene el resumen consolidado del comerciante.
 *
 * @throws ApiError si falla la petición o la conexión.
 */
export async function obtenerReporteDashboard(): Promise<ReporteDashboard> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<ReporteDashboard>("/api/reportes/dashboard");
}
