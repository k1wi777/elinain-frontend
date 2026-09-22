"use client";

import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { buscarCoordenadas } from "@/features/fincas/api/geocodificacion";
import type { ResultadoGeocodificacion } from "@/features/fincas/types";

/**
 * Mutación de geocodificación de una dirección.
 *
 * No tiene query key porque no cachea datos de servidor: es una acción puntual del
 * formulario. El error se expone tipado como `ApiError` para traducirlo, incluido el
 * `404` de dirección no encontrada.
 */
export function useGeocodificacion() {
  return useMutation<ResultadoGeocodificacion, ApiError, string>({
    mutationFn: buscarCoordenadas,
  });
}
