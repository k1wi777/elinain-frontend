import { formatearConteo } from "@/features/dashboard/formato";
import type { ResumenDashboard } from "@/features/dashboard/types";

/**
 * Lógica pura del resumen narrativo del dashboard.
 *
 * Construye una o más frases en español derivadas únicamente de las cifras reales de
 * `ResumenDashboard`, para que un comerciante de baja adopción tecnológica entienda el
 * resultado sin interpretar tablas. No consulta la API, no conoce React y no inventa
 * datos: ante valores ausentes o no finitos normaliza a `0` y nunca divide por cero.
 */

/** Normaliza un valor del DTO a un número finito, usando `0` ante ausentes o inválidos. */
function numeroSeguro(valor: number | null | undefined): number {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : 0;
}

/** Devuelve la forma singular si la cantidad es exactamente uno y la plural si no. */
function pluralizar(
  cantidad: number,
  singular: string,
  plural: string,
): string {
  return cantidad === 1 ? singular : plural;
}

/**
 * Calcula un porcentaje entero seguro.
 *
 * Devuelve `null` cuando el total no permite dividir (`total <= 0`) o cuando la parte
 * cae fuera del rango válido (`parte < 0` o `parte > total`). En cualquier otro caso
 * redondea a entero, de modo que el resultado siempre queda entre 0 y 100.
 */
function porcentajeSeguro(parte: number, total: number): number | null {
  if (total <= 0 || parte < 0 || parte > total) {
    return null;
  }

  return Math.round((parte / total) * 100);
}

/** Frase que resume los conteos operativos, con la coletilla de contratos cerrados. */
function construirFraseOperacion(
  contratosActivos: number,
  contratosCerrados: number,
  animales: number,
): string {
  const contratosTexto = pluralizar(
    contratosActivos,
    "contrato activo",
    "contratos activos",
  );
  const animalesTexto = pluralizar(
    animales,
    "animal en inventario",
    "animales en inventario",
  );

  let frase: string;

  if (contratosActivos > 0 && animales > 0) {
    frase = `Tienes ${formatearConteo(contratosActivos)} ${contratosTexto} y ${formatearConteo(animales)} ${animalesTexto}.`;
  } else if (contratosActivos > 0) {
    frase = `Tienes ${formatearConteo(contratosActivos)} ${contratosTexto}, sin animales en inventario por ahora.`;
  } else if (animales > 0) {
    frase = `No tienes contratos activos, pero hay ${formatearConteo(animales)} ${animalesTexto}.`;
  } else {
    frase =
      "Ahora mismo no tienes contratos activos ni animales en inventario.";
  }

  if (contratosCerrados > 0) {
    const coletilla =
      contratosCerrados === 1
        ? ", y hasta hoy se ha cerrado 1 contrato"
        : `, y hasta hoy se han cerrado ${formatearConteo(contratosCerrados)} contratos`;

    frase = `${frase.slice(0, -1)}${coletilla}.`;
  }

  return frase;
}

/**
 * Construye el resumen narrativo del dashboard a partir del resumen consolidado.
 *
 * Devuelve entre una y tres frases: la operación siempre está presente; la participación
 * del comerciante y de los socios se añaden solo cuando su porcentaje es calculable y
 * mayor que cero. El resultado queda limitado a tres frases.
 *
 * @param resumen Resumen consolidado entregado por el backend.
 * @returns Frases cortas en español, listas para mostrar.
 */
export function construirNarrativa(resumen: ResumenDashboard): string[] {
  const contratosActivos = numeroSeguro(resumen.contratos_activos);
  const contratosCerrados = numeroSeguro(resumen.contratos_cerrados);
  const animales = numeroSeguro(resumen.total_animales_actual);
  const utilidadTotal = numeroSeguro(resumen.utilidad_total_acumulada);
  const utilidadComerciante = numeroSeguro(
    resumen.utilidad_real_comerciante_acumulada,
  );
  const utilidadTerceros = numeroSeguro(resumen.utilidad_terceros_acumulada);

  const frases = [
    construirFraseOperacion(contratosActivos, contratosCerrados, animales),
  ];

  const porcentajeComerciante = porcentajeSeguro(
    utilidadComerciante,
    utilidadTotal,
  );
  if (porcentajeComerciante !== null && porcentajeComerciante > 0) {
    frases.push(
      porcentajeComerciante === 100
        ? "Toda la utilidad acumulada de las ventas es tuya como comerciante."
        : `De la utilidad acumulada de las ventas, ${porcentajeComerciante}% es tuya como comerciante.`,
    );
  }

  const porcentajeTerceros = porcentajeSeguro(utilidadTerceros, utilidadTotal);
  if (porcentajeTerceros !== null && porcentajeTerceros > 0) {
    frases.push(
      porcentajeTerceros === 100
        ? "Toda la utilidad acumulada corresponde a los socios de participación."
        : `Los socios de participación tienen ${porcentajeTerceros}% de la utilidad acumulada de las ventas.`,
    );
  }

  return frases.slice(0, 3);
}
