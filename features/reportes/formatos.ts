/**
 * Formateadores locales del feature `reportes`.
 *
 * Las cifras se presentan tal como las entrega el backend: estos helpers solo aplican
 * formato es-CO, sin recalcular ni transformar los valores. Se declaran en el feature
 * (no en `shared/lib` ni reutilizando el formateador de otro feature) conforme al
 * aislamiento entre features.
 */

/** Moneda es-CO (COP) sin decimales, usada por el backend para las cifras monetarias. */
const FORMATO_MONEDA = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Conteo es-CO con separador de miles y sin decimales. */
const FORMATO_CONTEO = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
});

/** Número es-CO con hasta un decimal, para pesos y kilos. */
const FORMATO_NUMERO = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 1,
});

/** Porcentaje es-CO con hasta dos decimales, sin el símbolo. */
const FORMATO_PORCENTAJE = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
});

/**
 * Formatea una cifra monetaria como moneda es-CO (COP).
 *
 * @param valor Monto tal como lo entrega el backend.
 */
export function formatearMoneda(valor: number): string {
  return FORMATO_MONEDA.format(valor);
}

/**
 * Formatea un conteo con separadores de miles es-CO.
 *
 * @param valor Cantidad tal como la entrega el backend.
 */
export function formatearConteo(valor: number): string {
  return FORMATO_CONTEO.format(valor);
}

/**
 * Formatea una cantidad o un peso en kilos con hasta un decimal.
 *
 * @param valor Número tal como lo entrega el backend.
 */
export function formatearNumero(valor: number): string {
  return FORMATO_NUMERO.format(valor);
}

/**
 * Formatea un porcentaje con hasta dos decimales y el símbolo `%`.
 *
 * @param valor Porcentaje sin el símbolo, tal como lo entrega el backend.
 */
export function formatearPorcentaje(valor: number): string {
  return `${FORMATO_PORCENTAJE.format(valor)}%`;
}
