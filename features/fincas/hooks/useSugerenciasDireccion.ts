"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { buscarSugerenciasDireccion } from "@/features/fincas/api/geocodificacion";
import { clavesFincas } from "@/features/fincas/query-keys";
import type { ResultadoGeocodificacion } from "@/features/fincas/types";

/** Mínimo de caracteres a partir del cual se piden sugerencias. */
const MINIMO_CARACTERES = 3;

/** Tiempo que TanStack Query conserva las sugerencias como frescas (5 minutos). */
const TIEMPO_FRESCO_MS = 5 * 60 * 1000;

/**
 * Consulta de sugerencias de dirección para el autocompletado.
 *
 * La consulta solo se habilita a partir del mínimo de caracteres; TanStack Query cachea
 * por consulta y `retry: false` evita ráfagas contra el BFF. No se obtienen datos con
 * `useEffect`: el debounce vive en el componente que consume este hook.
 *
 * @param consulta Texto (ya debounced) escrito por el usuario.
 */
export function useSugerenciasDireccion(consulta: string) {
  const consultaNormalizada = consulta.trim();

  return useQuery<ResultadoGeocodificacion[], ApiError>({
    queryKey: clavesFincas.sugerencias(consultaNormalizada),
    queryFn: () => buscarSugerenciasDireccion(consultaNormalizada),
    enabled: consultaNormalizada.length >= MINIMO_CARACTERES,
    staleTime: TIEMPO_FRESCO_MS,
    retry: false,
  });
}
