import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature `compras`.
 *
 * Los DTOs se derivan del OpenAPI en lugar de redefinirse a mano, conforme a las
 * convenciones del proyecto. El tipo propio es `FiltrosCompras`, que añade el filtro por
 * contrato al listado paginado.
 */

/** Compra tal como la devuelve el backend. */
export type Compra = ApiSchemas["CompraRespuestaDto"];

/** Página paginada del listado de compras (`GET /compras`). */
export type PaginaCompras = ApiSchemas["PaginaComprasDto"];

/** Datos de creación de una compra (`POST /compras`). */
export type CrearCompra = ApiSchemas["CrearCompraDto"];

/** Datos de actualización parcial de una compra (`PATCH /compras/{id}`). */
export type ActualizarCompra = ApiSchemas["ActualizarCompraDto"];

/** Filtros del listado de compras: paginación y contrato. */
export type FiltrosCompras = {
  /** Cantidad de registros por página. */
  limite: number;
  /** Registros omitidos desde el inicio. */
  offset: number;
  /** Identificador del contrato del que se listan las compras. */
  contrato_id: string;
};
