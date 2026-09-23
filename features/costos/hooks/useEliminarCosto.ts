"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { eliminarCosto } from "@/features/costos/api/costos";
import { clavesCostos } from "@/features/costos/query-keys";

/**
 * Mutación de eliminación de un costo.
 *
 * Al completarse invalida el listado para que se actualice sin recargar la página. El error
 * se expone tipado como `ApiError` para que el modal lo traduzca.
 */
export function useEliminarCosto() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: eliminarCosto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesCostos.listas() });
    },
  });
}
