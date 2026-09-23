import type { Venta } from "@/features/ventas/types";

/**
 * Distribución contractual derivada de los montos reales de una venta.
 *
 * Los porcentajes se calculan sobre la suma de `valor_comerciante` y `valor_tercero`, que
 * el backend ya asigna según el contrato; no se recalcula el reparto ni se requieren
 * porcentajes del contrato.
 */
export type DistribucionLiquidacion = {
  /** Porcentaje del reparto asignado al comerciante (0 a 100). */
  porcentajeComerciante: number;
  /** Porcentaje del reparto asignado al tercero (0 a 100). */
  porcentajeTercero: number;
};

/**
 * Calcula la distribución del reparto de una venta.
 *
 * @param venta Venta con el desglose financiero congelado.
 * @returns Los porcentajes o `null` cuando la suma del reparto no es mayor que cero.
 */
export function calcularDistribucionLiquidacion(
  venta: Venta,
): DistribucionLiquidacion | null {
  const total = venta.valor_comerciante + venta.valor_tercero;

  if (!(total > 0)) {
    return null;
  }

  return {
    porcentajeComerciante: (venta.valor_comerciante / total) * 100,
    porcentajeTercero: (venta.valor_tercero / total) * 100,
  };
}
