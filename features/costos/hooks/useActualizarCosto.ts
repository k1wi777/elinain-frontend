"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { actualizarCosto } from "@/features/costos/api/costos";
import { clavesCostos } from "@/features/costos/query-keys";
import type { ActualizarCosto, Costo } from "@/features/costos/types";

/** Variables de la mutación de edición: identificador y campos a modificar. */
export type VariablesActualizarCosto = {
  id: string;
  datos: ActualizarCosto;
};

/**
 * Mutación de edición de un costo.
 *
 * Al completarse invalida el listado para que se refresque sin recargar la página. El error
 * se expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useActualizarCosto() {
  const queryClient = useQueryClient();

  return useMutation<Costo, ApiError, VariablesActualizarCosto>({
    mutationFn: ({ id, datos }) => actualizarCosto(id, datos),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesCostos.listas() });
    },
  });
}
