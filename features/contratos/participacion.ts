/**
 * Composición de la participación de un contrato.
 *
 * El listado y el detalle presentan ambos porcentajes en una sola columna con el formato
 * `comerciante% / tercero%`.
 */

/** Porcentajes de participación de un contrato. */
export type PorcentajesParticipacion = {
  /** Porcentaje correspondiente al comerciante. */
  porcentaje_comerciante: number;
  /** Porcentaje correspondiente al tercero. */
  porcentaje_tercero: number;
};

/**
 * Formatea los porcentajes como `comerciante% / tercero%`.
 *
 * @param porcentajes Porcentajes de participación del contrato.
 */
export function formatearParticipacion(
  porcentajes: PorcentajesParticipacion,
): string {
  return `${porcentajes.porcentaje_comerciante}% / ${porcentajes.porcentaje_tercero}%`;
}
