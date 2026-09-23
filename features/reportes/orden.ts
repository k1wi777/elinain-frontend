import type {
  ContratoActivoDetalle,
  VentaHistorialItem,
} from "@/features/reportes/types";

/**
 * Lógica pura de ordenación y recorte de los reportes.
 *
 * Se extrae de los componentes para poder probarla con Jest sin render: la UI solo la
 * invoca durante el render. La ordenación no altera el arreglo recibido y los valores
 * se muestran tal como llegan; ordenar y recortar es presentación, no recálculo.
 */

/** Número de ventas más recientes visibles mientras el historial no está expandido. */
export const LIMITE_VENTAS_VISIBLES = 50;

/** Instante en milisegundos de una fecha ISO; `0` si no es interpretable. */
function aMarcaTiempo(fecha: string): number {
  const marca = new Date(fecha).getTime();

  return Number.isNaN(marca) ? 0 : marca;
}

/**
 * Ordena los contratos activos por utilidad generada por el comerciante, de forma
 * descendente, para comparar de un vistazo qué contratos rinden mejor.
 *
 * @param contratos Contratos tal como los entrega el backend.
 */
export function ordenarContratosPorUtilidadDescendente(
  contratos: ContratoActivoDetalle[],
): ContratoActivoDetalle[] {
  return [...contratos].sort(
    (a, b) => b.utilidad_generada_comerciante - a.utilidad_generada_comerciante,
  );
}

/**
 * Ordena las ventas por fecha de forma descendente, de la más reciente a la más antigua.
 *
 * @param ventas Ventas tal como las entrega el backend.
 */
export function ordenarVentasPorFechaDescendente(
  ventas: VentaHistorialItem[],
): VentaHistorialItem[] {
  return [...ventas].sort(
    (a, b) => aMarcaTiempo(b.fecha) - aMarcaTiempo(a.fecha),
  );
}

/**
 * Recorta las ventas ya ordenadas a las más recientes mientras el historial no está
 * expandido. Al expandir, devuelve todas.
 *
 * @param ventas Ventas ya ordenadas por fecha descendente.
 * @param expandido Indica si el historial está expandido.
 */
export function recortarVentas(
  ventas: VentaHistorialItem[],
  expandido: boolean,
): VentaHistorialItem[] {
  if (expandido) {
    return ventas;
  }

  return ventas.slice(0, LIMITE_VENTAS_VISIBLES);
}
