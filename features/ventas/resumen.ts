import type { Venta } from "@/features/ventas/types";

/**
 * Resumen agregado del listado de ventas.
 *
 * Todas las cifras se calculan en el cliente a partir de las ventas reales que devuelve
 * `useVentas`; no se derivan métricas de otras fuentes ni se inventan datos ausentes del
 * DTO. Los agregados corresponden únicamente a los registros recibidos, por lo que la
 * presentación debe aclarar que no son totales globales.
 */
export type ResumenVentas = {
  /** Suma de `valor_bruto` de las ventas recibidas. */
  valorBrutoTotal: number;
  /** Suma de `utilidad_total` de las ventas recibidas. */
  utilidadTotalLiquidada: number;
  /** Suma de `valor_comerciante` de las ventas recibidas. */
  valorComerciante: number;
  /** Suma de `valor_tercero` de las ventas recibidas. */
  valorTercero: number;
  /**
   * Utilidad total acumulada sobre el costo estimado acumulado, en porcentaje, o `null`
   * cuando el costo sumado no es mayor que cero.
   */
  rentabilidad: number | null;
};

/** Indica si un valor opcional es un número utilizable. */
function esNumero(valor: number | null | undefined): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

/** Suma un campo numérico de las ventas, ignorando `null`/`undefined`. */
function sumar(ventas: Venta[], obtener: (venta: Venta) => number): number {
  return ventas.reduce((acumulado, venta) => {
    const valor = obtener(venta);

    return esNumero(valor) ? acumulado + valor : acumulado;
  }, 0);
}

/**
 * Calcula el resumen del listado de ventas.
 *
 * Ignora `null`/`undefined` al sumar, de modo que las ventas con datos parciales no
 * distorsionen los agregados. La rentabilidad es la utilidad total acumulada sobre el
 * costo estimado acumulado, en porcentaje; vale `null` cuando el costo acumulado no es
 * mayor que cero para no dividir por cero.
 *
 * @param ventas Ventas cargadas, normalmente las de la página actual.
 */
export function calcularResumenVentas(ventas: Venta[]): ResumenVentas {
  const utilidadTotalLiquidada = sumar(ventas, (venta) => venta.utilidad_total);
  const costoTotal = sumar(ventas, (venta) => venta.costo_estimado_compra);

  return {
    valorBrutoTotal: sumar(ventas, (venta) => venta.valor_bruto),
    utilidadTotalLiquidada,
    valorComerciante: sumar(ventas, (venta) => venta.valor_comerciante),
    valorTercero: sumar(ventas, (venta) => venta.valor_tercero),
    rentabilidad:
      costoTotal > 0 ? (utilidadTotalLiquidada / costoTotal) * 100 : null,
  };
}
