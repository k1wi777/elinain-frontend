/**
 * Formato de las cifras que se presentan al usuario.
 *
 * Concentra los `Intl.NumberFormat` en español de Colombia para que las tarjetas y el modal
 * de resultado muestren los valores de forma consistente: moneda COP sin decimales, kilos
 * con hasta un decimal y porcentajes con hasta dos.
 */

const FORMATO_MONEDA = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const FORMATO_NUMERO = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 1,
});

const FORMATO_PORCENTAJE = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
});

/**
 * Formatea un valor monetario en pesos colombianos, sin decimales.
 *
 * @param valor Monto en pesos.
 */
export function formatearMoneda(valor: number): string {
  return FORMATO_MONEDA.format(valor);
}

/**
 * Formatea una cantidad o un peso en kilos, con hasta un decimal.
 *
 * @param valor Número a presentar.
 */
export function formatearNumero(valor: number): string {
  return FORMATO_NUMERO.format(valor);
}

/**
 * Formatea un porcentaje con hasta dos decimales y el símbolo `%`.
 *
 * @param valor Porcentaje sin el símbolo.
 */
export function formatearPorcentaje(valor: number): string {
  return `${FORMATO_PORCENTAJE.format(valor)}%`;
}
