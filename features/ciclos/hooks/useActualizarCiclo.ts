"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { actualizarCiclo } from "@/features/ciclos/api/ciclos";
import { clavesCiclos } from "@/features/ciclos/query-keys";
import type { ActualizarCiclo, Ciclo } from "@/features/ciclos/types";

/** Variables de la mutación de edición: identificador y campos a modificar. */
export type VariablesActualizarCiclo = {
  id: string;
  datos: ActualizarCiclo;
};

/**
 * Mutación de edición de un ciclo.
 *
 * Al completarse invalida el listado para que se refresque sin recargar la página. El error
 * se expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useActualizarCiclo() {
  const queryClient = useQueryClient();

  return useMutation<Ciclo, ApiError, VariablesActualizarCiclo>({
    mutationFn: ({ id, datos }) => actualizarCiclo(id, datos),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesCiclos.listas() });
    },
  });
}
