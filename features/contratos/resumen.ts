import type { Contrato } from "@/features/contratos/types";

/**
 * Resumen agregado del listado de contratos.
 *
 * Todas las cifras se calculan en el cliente a partir de los contratos reales que devuelve
 * `useContratos`; no se derivan métricas de otras fuentes ni se inventan datos ausentes del
 * DTO. Los promedios se redondean a entero y valen `null` cuando no hay valores con los que
 * calcularlos.
 */
export type ResumenContratos = {
  /** Cantidad de contratos en estado `activo`. */
  contratosActivos: number;
  /** Suma de cabezas de ganado en pie (`cantidad_actual`). */
  cabezasEnPie: number;
  /** Promedio de peso en kilos (`peso_promedio_actual`) o `null` sin datos. */
  pesoPromedioEnPie: number | null;
  /** Promedio de participación del comerciante o `null` sin datos. */
  porcentaje_comerciante: number | null;
  /** Promedio de participación del tercero o `null` sin datos. */
  porcentaje_tercero: number | null;
};

/** Indica si un valor opcional es un número utilizable. */
function esNumero(valor: number | null | undefined): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

/** Promedio entero de una lista; `null` cuando no hay valores. */
function promedio(valores: number[]): number | null {
  if (valores.length === 0) {
    return null;
  }

  const suma = valores.reduce((acumulado, valor) => acumulado + valor, 0);

  return Math.round(suma / valores.length);
}

/**
 * Calcula el resumen del listado de contratos.
 *
 * Ignora `null`/`undefined` al sumar cabezas y al promediar pesos y porcentajes, de modo
 * que los contratos con datos parciales no distorsionen los agregados. Los nombres de los
 * porcentajes coinciden con {@link PorcentajesParticipacion} para reutilizar
 * `formatearParticipacion` en la presentación cuando ambos promedios existen.
 *
 * @param contratos Contratos cargados.
 */
export function calcularResumenContratos(
  contratos: Contrato[],
): ResumenContratos {
  const contratosActivos = contratos.filter(
    (contrato) => contrato.estado === "activo",
  ).length;

  const cabezasEnPie = contratos.reduce(
    (acumulado, contrato) =>
      esNumero(contrato.cantidad_actual)
        ? acumulado + contrato.cantidad_actual
        : acumulado,
    0,
  );

  const pesos = contratos
    .map((contrato) => contrato.peso_promedio_actual)
    .filter(esNumero);

  const porcentajesComerciante = contratos
    .map((contrato) => contrato.porcentaje_comerciante)
    .filter(esNumero);

  const porcentajesTercero = contratos
    .map((contrato) => contrato.porcentaje_tercero)
    .filter(esNumero);

  return {
    contratosActivos,
    cabezasEnPie,
    pesoPromedioEnPie: promedio(pesos),
    porcentaje_comerciante: promedio(porcentajesComerciante),
    porcentaje_tercero: promedio(porcentajesTercero),
  };
}
