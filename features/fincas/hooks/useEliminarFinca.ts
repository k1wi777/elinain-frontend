"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { eliminarFinca } from "@/features/fincas/api/fincas";
import { clavesFincas } from "@/features/fincas/query-keys";

/**
 * Mutación de eliminación de una finca.
 *
 * Al completarse invalida el listado, el mapa y el detalle, de modo que la interfaz se
 * actualice sin recargar la página. El error se expone tipado como `ApiError` para que el
 * modal lo traduzca, incluido el `409` de contratos vinculados.
 */
export function useEliminarFinca() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: eliminarFinca,
    onSuccess: async (_resultado, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clavesFincas.listas() }),
        queryClient.invalidateQueries({ queryKey: clavesFincas.mapa() }),
        queryClient.invalidateQueries({
          queryKey: clavesFincas.detalle(id),
        }),
      ]);
    },
  });
}
