import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature `costos`.
 *
 * Los DTOs se derivan del OpenAPI en lugar de redefinirse a mano, conforme a las
 * convenciones del proyecto. El tipo propio es `FiltrosCostos`, que añade el filtro por
 * contrato al listado paginado.
 */

/** Costo informativo asociado a un contrato, tal como lo devuelve el backend. */
export type Costo = ApiSchemas["CostoRespuestaDto"];

/** Página paginada del listado de costos (`GET /costos`). */
export type PaginaCostos = ApiSchemas["PaginaCostosDto"];

/** Datos de creación de un costo (`POST /costos`). */
export type CrearCosto = ApiSchemas["CrearCostoDto"];

/** Datos de actualización parcial de un costo (`PATCH /costos/{id}`). */
export type ActualizarCosto = ApiSchemas["ActualizarCostoDto"];

/** Filtros del listado de costos: paginación y contrato. */
export type FiltrosCostos = {
  /** Cantidad de registros por página. */
  limite: number;
  /** Registros omitidos desde el inicio. */
  offset: number;
  /** Identificador del contrato del que se listan los costos. */
  contrato_id: string;
};
