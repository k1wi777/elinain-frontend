import { createBffClient } from "@/shared/api/bff-client";
import type { HttpClient } from "@/shared/api/http-client";
import type {
  ReporteContratosActivos,
  ReporteHistorialVentas,
} from "@/features/reportes/types";

/**
 * Acceso a los reportes del comerciante a través del BFF.
 *
 * Delega en `createBffClient` (mismo origen, con la cookie httpOnly adjunta por el
 * navegador) y propaga el `ApiError` que produzca el cliente HTTP. Los componentes nunca
 * conocen las URLs ni llaman a `fetch`.
 */

/**
 * Obtiene el reporte de contratos activos del comerciante.
 *
 * @throws ApiError si falla la petición o la conexión.
 */
export async function obtenerReporteContratosActivos(): Promise<ReporteContratosActivos> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<ReporteContratosActivos>(
    "/api/reportes/contratos-activos",
  );
}

/**
 * Obtiene el historial de ventas del comerciante.
 *
 * @throws ApiError si falla la petición o la conexión.
 */
export async function obtenerReporteHistorialVentas(): Promise<ReporteHistorialVentas> {
  const cliente: HttpClient = createBffClient();

  return cliente.get<ReporteHistorialVentas>("/api/reportes/historial-ventas");
}
