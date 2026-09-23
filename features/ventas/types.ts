import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature `ventas`.
 *
 * Los DTOs se derivan del OpenAPI en lugar de redefinirse a mano, conforme a las
 * convenciones del proyecto. Los tipos propios son `FiltrosVentas`, que añade el filtro
 * opcional por contrato al listado paginado, y la proyección `ContratoVenta` que `app/`
 * construye para el selector del listado global (el feature no importa de
 * `features/contratos`).
 */

/** Venta tal como la devuelve el backend, con el desglose financiero congelado. */
export type Venta = ApiSchemas["VentaRespuestaDto"];

/** Página paginada del listado de ventas (`GET /ventas`). */
export type PaginaVentas = ApiSchemas["PaginaVentasDto"];

/** Datos de creación de una venta (`POST /ventas`). */
export type CrearVenta = ApiSchemas["CrearVentaDto"];

/** Filtros del listado de ventas: paginación y contrato opcional. */
export type FiltrosVentas = {
  /** Cantidad de registros por página. */
  limite: number;
  /** Registros omitidos desde el inicio. */
  offset: number;
  /** Identificador del contrato del que se listan las ventas; sin él se listan todas. */
  contrato_id?: string;
};

/**
 * Contrato reducido a identidad y etiqueta legible para el selector.
 *
 * `app/` lo construye a partir de los contratos para que el feature ofrezca el filtro y el
 * formulario globales sin conocer `features/contratos`.
 */
export type ContratoVenta = {
  /** Identificador del contrato. */
  id: string;
  /** Texto visible que describe el contrato. */
  etiqueta: string;
};
