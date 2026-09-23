/**
 * API pública del feature `reportes`.
 *
 * Expone las dos vistas que `app/` compone en `/reportes/contratos-activos` y
 * `/reportes/historial-ventas`. `api/`, `hooks/`, `types.ts`, `formatos.ts`,
 * `mensajes-error.ts`, `orden.ts` y `TarjetaIndicador` son internos.
 */
export { ContratosActivosReporte } from "@/features/reportes/components/ContratosActivosReporte";
export { HistorialVentasReporte } from "@/features/reportes/components/HistorialVentasReporte";
