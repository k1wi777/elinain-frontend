/**
 * Lógica pura de paginación alineada al contrato del backend (`limite`/`offset`).
 *
 * No conoce React ni TanStack Query: recibe sus entradas y devuelve valores, por lo que
 * es reusable por cualquier listado paginado (terceros, fincas, contratos) y testeable sin
 * red ni render.
 */

/** Cantidad de registros por página usada cuando no se indica un límite. */
export const LIMITE_POR_DEFECTO = 20;

/** Límite mínimo aceptado por el backend. */
export const LIMITE_MINIMO = 1;

/** Límite máximo aceptado por el backend. */
export const LIMITE_MAXIMO = 100;

/**
 * Normaliza el límite al rango aceptado por el backend (1–100).
 *
 * Si el valor no es un número finito devuelve {@link LIMITE_POR_DEFECTO}; si está por
 * debajo del mínimo devuelve {@link LIMITE_MINIMO}; si supera el máximo lo recorta a
 * {@link LIMITE_MAXIMO}.
 *
 * @param limite Valor de límite sin normalizar.
 */
export function normalizarLimite(limite: number): number {
  if (!Number.isFinite(limite)) {
    return LIMITE_POR_DEFECTO;
  }

  if (limite < LIMITE_MINIMO) {
    return LIMITE_MINIMO;
  }

  if (limite > LIMITE_MAXIMO) {
    return LIMITE_MAXIMO;
  }

  return limite;
}

/**
 * Calcula el total de páginas a partir del total de registros y el límite.
 *
 * Devuelve al menos 1 página para que la interfaz siempre muestre "Página 1 de 1" cuando
 * no hay registros.
 *
 * @param total Total de registros reportado por el backend.
 * @param limite Cantidad de registros por página.
 */
export function calcularTotalPaginas(total: number, limite: number): number {
  return Math.max(1, Math.ceil(total / limite));
}

/**
 * Calcula la página actual (base 1) a partir del offset y el límite.
 *
 * @param offset Registros omitidos desde el inicio.
 * @param limite Cantidad de registros por página.
 */
export function calcularPagina(offset: number, limite: number): number {
  return Math.floor(offset / limite) + 1;
}

/**
 * Calcula el offset correspondiente a una página (base 1), nunca negativo.
 *
 * @param pagina Página solicitada.
 * @param limite Cantidad de registros por página.
 */
export function calcularOffset(pagina: number, limite: number): number {
  return Math.max(0, (pagina - 1) * limite);
}

/**
 * Acota una página al rango válido `[1, totalPaginas]`.
 *
 * @param pagina Página solicitada.
 * @param totalPaginas Total de páginas disponibles.
 */
export function normalizarPagina(pagina: number, totalPaginas: number): number {
  const paginaMinima = Math.max(1, totalPaginas);
  return Math.min(Math.max(1, pagina), paginaMinima);
}
