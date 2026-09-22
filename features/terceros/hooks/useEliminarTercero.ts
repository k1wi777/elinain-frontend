"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { eliminarTercero } from "@/features/terceros/api/terceros";
import { clavesTerceros } from "@/features/terceros/query-keys";

/**
 * Mutación de eliminación de un tercero.
 *
 * Al completarse invalida todas las listas para que el listado se refresque sin recargar
 * la página. El error se expone tipado como `ApiError` para que la tabla lo traduzca,
 * incluido el `409` de contratos activos.
 */
export function useEliminarTercero() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: eliminarTercero,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: clavesTerceros.listas(),
      });
    },
  });
}
