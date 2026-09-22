"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { actualizarTercero } from "@/features/terceros/api/terceros";
import { clavesTerceros } from "@/features/terceros/query-keys";
import type { ActualizarTercero, Tercero } from "@/features/terceros/types";

/** Variables de la mutación de edición: identificador y campos a modificar. */
export type VariablesActualizarTercero = {
  id: string;
  datos: ActualizarTercero;
};

/**
 * Mutación de edición de un tercero.
 *
 * Al completarse invalida todas las listas para que el listado se refresque sin recargar
 * la página. El error se expone tipado como `ApiError` para que la tabla lo traduzca.
 */
export function useActualizarTercero() {
  const queryClient = useQueryClient();

  return useMutation<Tercero, ApiError, VariablesActualizarTercero>({
    mutationFn: ({ id, datos }) => actualizarTercero(id, datos),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: clavesTerceros.listas(),
      });
    },
  });
}
