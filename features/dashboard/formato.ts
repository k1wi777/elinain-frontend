/**
 * Formateadores locales del feature `dashboard`.
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
