import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature `ciclos`.
 *
 * Los DTOs se derivan del OpenAPI en lugar de redefinirse a mano, conforme a las
 * convenciones del proyecto. El tipo propio es `FiltrosCiclos`, que añade el filtro por
 * contrato al listado paginado.
 */

/** Ciclo (checkpoint de engorde) tal como lo devuelve el backend. */
export type Ciclo = ApiSchemas["CicloRespuestaDto"];

/** Página paginada del listado de ciclos (`GET /ciclos`). */
export type PaginaCiclos = ApiSchemas["PaginaCiclosDto"];

/** Datos de creación de un ciclo (`POST /ciclos`). */
export type CrearCiclo = ApiSchemas["CrearCicloDto"];

/** Datos de actualización parcial de un ciclo (`PATCH /ciclos/{id}`). */
export type ActualizarCiclo = ApiSchemas["ActualizarCicloDto"];

/** Filtros del listado de ciclos: paginación y contrato. */
export type FiltrosCiclos = {
  /** Cantidad de registros por página. */
  limite: number;
  /** Registros omitidos desde el inicio. */
  offset: number;
  /** Identificador del contrato del que se listan los ciclos. */
  contrato_id: string;
};
