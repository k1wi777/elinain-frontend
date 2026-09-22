import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature `terceros`.
 *
 * La interfaz llama a la entidad "Socio de participación"; el feature y el backend la
 * siguen nombrando `tercero`. Los tipos se derivan del OpenAPI en lugar de redefinirse a
 * mano, conforme a las convenciones del proyecto.
 */

/** Tercero (socio de participación) tal como lo devuelve el backend. */
export type Tercero = ApiSchemas["TerceroRespuestaDto"];

/** Página paginada del listado de terceros (`GET /terceros`). */
export type PaginaTerceros = ApiSchemas["PaginaTercerosDto"];

/** Datos de creación de un tercero (`POST /terceros`). */
export type CrearTercero = ApiSchemas["CrearTerceroDto"];

/** Datos de actualización parcial de un tercero (`PATCH /terceros/{id}`). */
export type ActualizarTercero = ApiSchemas["ActualizarTerceroDto"];

/** Filtros de paginación del listado de terceros. */
export type FiltrosTerceros = {
  /** Cantidad de registros por página. */
  limite: number;
  /** Registros omitidos desde el inicio. */
  offset: number;
};
