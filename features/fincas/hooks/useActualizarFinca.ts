"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { actualizarFinca } from "@/features/fincas/api/fincas";
import { clavesFincas } from "@/features/fincas/query-keys";
import type { ActualizarFinca, Finca } from "@/features/fincas/types";

/** Variables de la mutación de edición: identificador y campos a modificar. */
export type VariablesActualizarFinca = {
  id: string;
  datos: ActualizarFinca;
};

/**
 * Mutación de edición de una finca.
 *
 * Al completarse invalida el listado, el mapa y el detalle de la finca editada. El error
 * se expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useActualizarFinca() {
  const queryClient = useQueryClient();

  return useMutation<Finca, ApiError, VariablesActualizarFinca>({
    mutationFn: ({ id, datos }) => actualizarFinca(id, datos),
    onSuccess: async (_finca, { id }) => {
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
