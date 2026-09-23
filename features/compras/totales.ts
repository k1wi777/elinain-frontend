import type { Compra } from "@/features/compras/types";

/**
 * Totales agregados de un conjunto de compras.
 *
 * Se calculan en el cliente a partir de las filas recibidas —las visibles de la página
 * actual—, porque el alcance del Work Item no permite consultas adicionales. `inversion`
 * suma `valor_total` tal como lo devuelve el backend, sin recalcularlo en el cliente.
 */
export type TotalesCompras = {
  /** Suma de cabezas compradas (`cantidad`). */
  cabezas: number;
  /** Suma de la inversión registrada (`valor_total`). */
  inversion: number;
};

/**
 * Calcula el volumen acumulado y la inversión total de las compras recibidas.
 *
 * @param compras Compras de las que se calculan los totales.
 */
export function calcularTotalesCompras(compras: Compra[]): TotalesCompras {
  return compras.reduce<TotalesCompras>(
    (totales, compra) => ({
      cabezas: totales.cabezas + compra.cantidad,
      inversion: totales.inversion + compra.valor_total,
    }),
    { cabezas: 0, inversion: 0 },
  );
}
