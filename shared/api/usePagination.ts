"use client";

import { useCallback, useState } from "react";

import {
  calcularOffset,
  calcularPagina,
  calcularTotalPaginas,
  LIMITE_POR_DEFECTO,
  normalizarLimite,
  normalizarPagina,
} from "@/shared/api/pagination";

/** Parámetros con los que se configura el estado inicial de la paginación. */
export type ParametrosPaginacion = {
  /** Total de registros de la respuesta actual del backend. */
  total: number;
  /** Límite de registros por página; por defecto {@link LIMITE_POR_DEFECTO}. */
  limiteInicial?: number;
  /** Offset de partida; por defecto 0. */
  offsetInicial?: number;
};

/** Estado y acciones de paginación expuestos al consumidor. */
export type EstadoPaginacion = {
  /** Cantidad de registros por página normalizada al rango del backend. */
  limite: number;
  /** Registros omitidos desde el inicio; nunca negativo. */
  offset: number;
  /** Total de registros recibido por parámetro. */
  total: number;
  /** Total de páginas, con un mínimo de 1. */
  totalPaginas: number;
  /** Página actual (base 1) normalizada dentro del rango válido. */
  paginaActual: number;
  /** Indica si existe una página anterior a la actual. */
  hayPaginaAnterior: boolean;
  /** Indica si existe una página siguiente a la actual. */
  hayPaginaSiguiente: boolean;
  /** Navega a una página concreta, normalizándola al rango válido. */
  irAPagina: (pagina: number) => void;
  /** Retrocede a la página anterior si está disponible. */
  irAPaginaAnterior: () => void;
  /** Avanza a la página siguiente si está disponible. */
  irAPaginaSiguiente: () => void;
  /** Cambia el tamaño de página y vuelve a la primera página. */
  cambiarLimite: (limite: number) => void;
  /** Restaura el límite y el offset a sus valores iniciales. */
  reiniciar: () => void;
};

/**
 * Gestiona el estado de paginación (`limite`/`offset`) de un listado.
 *
 * El `total` se recibe por parámetro desde la respuesta del backend y todo el cálculo
 * derivado se resuelve en render delegando en la lógica pura de `pagination.ts`; el hook
 * no obtiene datos, no conoce TanStack Query y no usa efectos.
 *
 * @param parametros Total de registros y valores iniciales opcionales.
 */
export function usePagination({
  total,
  limiteInicial,
  offsetInicial,
}: ParametrosPaginacion): EstadoPaginacion {
  const [valoresIniciales] = useState(() => ({
    limite: normalizarLimite(limiteInicial ?? LIMITE_POR_DEFECTO),
    offset: Math.max(0, offsetInicial ?? 0),
  }));
  const [limite, setLimite] = useState(valoresIniciales.limite);
  const [offset, setOffset] = useState(valoresIniciales.offset);

  const totalPaginas = calcularTotalPaginas(total, limite);
  const paginaActual = normalizarPagina(
    calcularPagina(offset, limite),
    totalPaginas,
  );
  const hayPaginaAnterior = offset > 0;
  const hayPaginaSiguiente = paginaActual < totalPaginas;

  const irAPagina = useCallback(
    (pagina: number) => {
      setOffset(calcularOffset(normalizarPagina(pagina, totalPaginas), limite));
    },
    [limite, totalPaginas],
  );

  const irAPaginaAnterior = useCallback(() => {
    if (!hayPaginaAnterior) {
      return;
    }

    setOffset(calcularOffset(paginaActual - 1, limite));
  }, [hayPaginaAnterior, paginaActual, limite]);

  const irAPaginaSiguiente = useCallback(() => {
    if (!hayPaginaSiguiente) {
      return;
    }

    setOffset(calcularOffset(paginaActual + 1, limite));
  }, [hayPaginaSiguiente, paginaActual, limite]);

  const cambiarLimite = useCallback((nuevoLimite: number) => {
    setLimite(normalizarLimite(nuevoLimite));
    setOffset(0);
  }, []);

  const reiniciar = useCallback(() => {
    setLimite(valoresIniciales.limite);
    setOffset(valoresIniciales.offset);
  }, [valoresIniciales]);

  return {
    limite,
    offset,
    total,
    totalPaginas,
    paginaActual,
    hayPaginaAnterior,
    hayPaginaSiguiente,
    irAPagina,
    irAPaginaAnterior,
    irAPaginaSiguiente,
    cambiarLimite,
    reiniciar,
  };
}
