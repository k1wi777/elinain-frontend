"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { eliminarCiclo } from "@/features/ciclos/api/ciclos";
import { clavesCiclos } from "@/features/ciclos/query-keys";

/**
 * Mutación de eliminación de un ciclo.
 *
 * Al completarse invalida el listado para que se actualice sin recargar la página. El error
 * se expone tipado como `ApiError` para que el modal lo traduzca.
 */
export function useEliminarCiclo() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: eliminarCiclo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesCiclos.listas() });
    },
  });
}
