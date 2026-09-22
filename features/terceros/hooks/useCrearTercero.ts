"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { crearTercero } from "@/features/terceros/api/terceros";
import { clavesTerceros } from "@/features/terceros/query-keys";
import type { CrearTercero, Tercero } from "@/features/terceros/types";

/**
 * Mutación de creación de un tercero.
 *
 * Al completarse invalida todas las listas para que el listado se refresque sin recargar
 * la página. El error se expone tipado como `ApiError` para que la tabla lo traduzca.
 */
export function useCrearTercero() {
  const queryClient = useQueryClient();

  return useMutation<Tercero, ApiError, CrearTercero>({
    mutationFn: crearTercero,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: clavesTerceros.listas(),
      });
    },
  });
}
