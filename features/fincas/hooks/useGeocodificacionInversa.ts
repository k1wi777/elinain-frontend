"use client";

import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { buscarDireccionInversa } from "@/features/fincas/api/geocodificacion";
import type {
  PosicionFinca,
  ResultadoGeocodificacion,
} from "@/features/fincas/types";

/**
 * Mutación de geocodificación inversa de un punto del mapa.
 *
 * No tiene query key porque no cachea datos de servidor: es una acción puntual que se
 * dispara al hacer clic o al soltar el pin. El error se expone tipado como `ApiError` para
 * traducirlo, incluido el `404` de punto sin dirección.
 */
export function useGeocodificacionInversa() {
  return useMutation<ResultadoGeocodificacion, ApiError, PosicionFinca>({
    mutationFn: (posicion) =>
      buscarDireccionInversa(posicion.latitud, posicion.longitud),
  });
}
