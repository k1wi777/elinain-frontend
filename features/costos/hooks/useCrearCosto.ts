"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { crearCosto } from "@/features/costos/api/costos";
import { clavesCostos } from "@/features/costos/query-keys";
import type { Costo, CrearCosto } from "@/features/costos/types";

/**
 * Mutación de registro de un costo.
 *
 * Al completarse invalida el listado para que se refresque sin recargar la página. El error
 * se expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useCrearCosto() {
  const queryClient = useQueryClient();

  return useMutation<Costo, ApiError, CrearCosto>({
    mutationFn: crearCosto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesCostos.listas() });
    },
  });
}
