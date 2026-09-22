import type { ApiSchemas } from "@/shared/api/types";

/**
 * Alias de los DTOs del backend usados por el feature `contratos`.
 *
 * Los DTOs se derivan del OpenAPI en lugar de redefinirse a mano, conforme a las
 * convenciones del proyecto. Los tipos propios son `EstadoContrato`,
 * `EstadoFiltroContrato` y las proyecciones `TerceroContrato`/`FincaContrato` que `app/`
 * construye para resolver nombres y filtrar fincas, porque `contratos` no importa de
 * otras features.
 */

/** Contrato de participación tal como lo devuelve el backend. */
export type Contrato = ApiSchemas["ContratoRespuestaDto"];

/** Página paginada del listado de contratos (`GET /contratos`). */
export type PaginaContratos = ApiSchemas["PaginaContratosDto"];

/** Datos de creación de un contrato (`POST /contratos`). */
export type CrearContrato = ApiSchemas["CrearContratoDto"];

/** Datos de actualización parcial de un contrato (`PATCH /contratos/{id}`). */
export type ActualizarContrato = ApiSchemas["ActualizarContratoDto"];

/** Filtros de paginación del listado de contratos. */
export type FiltrosContratos = {
  /** Cantidad de registros por página. */
  limite: number;
  /** Registros omitidos desde el inicio. */
  offset: number;
};

/** Estado de un contrato. */
export type EstadoContrato = "activo" | "cerrado";

/** Estado por el que se puede filtrar el listado; `todos` no filtra. */
export type EstadoFiltroContrato = "todos" | EstadoContrato;

/**
 * Tercero reducido al par identidad/nombre.
 *
 * `ContratoRespuestaDto` solo devuelve `tercero_id`; `app/` transforma la lista de
 * terceros a esta proyección para que el feature resuelva el nombre sin conocer
 * `features/terceros`.
 */
export type TerceroContrato = {
  /** Identificador del tercero. */
  id: string;
  /** Nombre legible del tercero. */
  nombre: string;
};

/**
 * Finca reducida a identidad, nombre y tercero propietario.
 *
 * `app/` la construye a partir de la lista completa de fincas para resolver nombres y
 * filtrar las fincas de un tercero sin que el feature importe de `features/fincas`.
 */
export type FincaContrato = {
  /** Identificador de la finca. */
  id: string;
  /** Nombre legible de la finca. */
  nombre: string;
  /** Identificador del tercero propietario de la finca. */
  tercero_id: string;
};
