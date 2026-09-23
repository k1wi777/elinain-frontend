import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature `dashboard`.
 *
 * Los DTOs se derivan del OpenAPI en lugar de redefinirse a mano, conforme a las
 * convenciones del proyecto. `shared/api/response.ts` desenvuelve el sobre
 * `{ exito, datos }` en ambos clientes HTTP, por lo que el código nunca trata
 * `RespuestaDashboardDto`: el tipo de datos es `ReporteDashboard`.
 */

/** Resumen consolidado de indicadores del comerciante (`ResumenDashboardDto`). */
export type ResumenDashboard = ApiSchemas["ResumenDashboardDto"];

/** Cuerpo del reporte del dashboard (`ReporteDashboardDto`). */
export type ReporteDashboard = ApiSchemas["ReporteDashboardDto"];
