import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature `reportes`.
 *
 * Los DTOs se derivan del OpenAPI en lugar de redefinirse a mano, conforme a las
 * convenciones del proyecto. `shared/api/response.ts` desenvuelve el sobre
 * `{ exito, datos }` en ambos clientes HTTP, por lo que el código nunca trata los
 * `Respuesta*ReporteDto`: los tipos de datos son el reporte de contratos activos y el
 * reporte del historial de ventas.
 */

/** Fila del reporte de contratos activos (`ContratoActivoDetalleDto`). */
export type ContratoActivoDetalle = ApiSchemas["ContratoActivoDetalleDto"];

/** Cuerpo del reporte de contratos activos (`ReporteContratosActivosDto`). */
export type ReporteContratosActivos = ApiSchemas["ReporteContratosActivosDto"];

/** Resumen agregado del historial de ventas (`ResumenHistorialVentasDto`). */
export type ResumenHistorialVentas = ApiSchemas["ResumenHistorialVentasDto"];

/** Fila del detalle del historial de ventas (`VentaHistorialItemDto`). */
export type VentaHistorialItem = ApiSchemas["VentaHistorialItemDto"];

/** Cuerpo del reporte del historial de ventas (`ReporteHistorialVentasDto`). */
export type ReporteHistorialVentas = ApiSchemas["ReporteHistorialVentasDto"];
