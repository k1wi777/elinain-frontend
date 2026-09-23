import type { ResumenHistorialVentas } from "@/features/reportes/types";

/** Campos del resumen necesarios para derivar la participación. */
export type UtilidadesResumen = Pick<
  ResumenHistorialVentas,
  "utilidad_comerciante_acumulada" | "utilidad_total_acumulada"
>;

/**
 * Deriva la participación del comerciante sobre la utilidad total acumulada.
 *
 * Calcula `utilidad_comerciante_acumulada / utilidad_total_acumulada × 100` a partir de las
 * cifras que ya entrega el backend; no recalcula la utilidad. Devuelve `null` cuando no hay
 * base para el reparto (total igual a cero o no finito), evitando la división por cero.
 *
 * @param resumen Utilidad del comerciante y utilidad total acumuladas.
 */
export function calcularParticipacionComerciante(
  resumen: UtilidadesResumen,
): number | null {
  const utilidadTotal = resumen.utilidad_total_acumulada;

  if (!Number.isFinite(utilidadTotal) || utilidadTotal === 0) {
    return null;
  }

  return (resumen.utilidad_comerciante_acumulada / utilidadTotal) * 100;
}
