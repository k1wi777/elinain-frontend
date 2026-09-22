import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature `fincas`.
 *
 * Los DTOs se derivan del OpenAPI en lugar de redefinirse a mano, conforme a las
 * convenciones del proyecto. Los tipos propios del feature son `Propietario` (el backend
 * solo devuelve `tercero_id`) y `ResultadoGeocodificacion` (contrato del proxy BFF).
 */

/** Finca tal como la devuelve el backend. */
export type Finca = ApiSchemas["FincaRespuestaDto"];

/** Página paginada del listado de fincas (`GET /fincas`). */
export type PaginaFincas = ApiSchemas["PaginaFincasDto"];

/** Datos de creación de una finca (`POST /fincas`). */
export type CrearFinca = ApiSchemas["CrearFincaDto"];

/** Datos de actualización parcial de una finca (`PATCH /fincas/{id}`). */
export type ActualizarFinca = ApiSchemas["ActualizarFincaDto"];

/** Filtros de paginación del listado de fincas. */
export type FiltrosFincas = {
  /** Cantidad de registros por página. */
  limite: number;
  /** Registros omitidos desde el inicio. */
  offset: number;
};

/**
 * Tercero propietario reducido al par identidad/nombre.
 *
 * `features/fincas` no conoce `features/terceros`: `app/` compone la lista de terceros y
 * la transforma a `Propietario[]` para resolver el nombre por `tercero_id`.
 */
export type Propietario = {
  /** Identificador del tercero. */
  id: string;
  /** Nombre legible del tercero. */
  nombre: string;
};

/** Coordenadas y etiqueta devueltas por el proxy de geocodificación. */
export type ResultadoGeocodificacion = {
  /** Latitud de la coincidencia. */
  latitud: number;
  /** Longitud de la coincidencia. */
  longitud: number;
  /** Descripción legible de la ubicación. */
  etiqueta: string;
};

/** Coordenadas de una finca, usadas por el formulario y su selector de mapa. */
export type PosicionFinca = {
  /** Latitud del pin. */
  latitud: number;
  /** Longitud del pin. */
  longitud: number;
};
