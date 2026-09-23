import type { ContratoActivoDetalle } from "@/features/reportes/types";

/**
 * Resumen agregado del reporte de contratos activos.
 *
 * Todas las cifras se calculan en el cliente a partir de los contratos reales que devuelve
 * `useReporteContratosActivos`; no se derivan de otras fuentes ni se inventan datos ausentes
 * del DTO. Los importes se suman tal como los entrega el backend, incluida su signo.
 */
export type ResumenContratosActivos = {
  /** Cantidad de contratos actualmente en curso. */
  contratosEnCurso: number;
  /** Suma de cabezas de ganado vivas (`cantidad_actual`). */
  ganadoEnPastoreo: number;
  /** Suma de compras o fusiones registradas (`total_compras`). */
  totalCompras: number;
  /** Suma de la utilidad neta generada por el comerciante (`utilidad_generada_comerciante`). */
  utilidadNetaGenerada: number;
};

/**
 * Calcula el resumen del reporte de contratos activos.
 *
 * Los cuatro agregados se derivan únicamente de campos que el backend ya entrega en
 * {@link ContratoActivoDetalle}. El conteo considera todos los contratos del reporte —que ya
 * llegan activos— y las sumas conservan el signo de cada valor, de modo que las pérdidas
 * reducen el acumulado.
 *
 * @param contratos Contratos activos cargados.
 */
export function calcularResumenContratos(
  contratos: ContratoActivoDetalle[],
): ResumenContratosActivos {
  return contratos.reduce<ResumenContratosActivos>(
    (acumulado, contrato) => ({
      contratosEnCurso: acumulado.contratosEnCurso + 1,
      ganadoEnPastoreo: acumulado.ganadoEnPastoreo + contrato.cantidad_actual,
      totalCompras: acumulado.totalCompras + contrato.total_compras,
      utilidadNetaGenerada:
        acumulado.utilidadNetaGenerada + contrato.utilidad_generada_comerciante,
    }),
    {
      contratosEnCurso: 0,
      ganadoEnPastoreo: 0,
      totalCompras: 0,
      utilidadNetaGenerada: 0,
    },
  );
}
