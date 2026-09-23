"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { crearCiclo } from "@/features/ciclos/api/ciclos";
import { clavesCiclos } from "@/features/ciclos/query-keys";
import type { Ciclo, CrearCiclo } from "@/features/ciclos/types";

/**
 * Mutación de registro de un ciclo.
 *
 * Al completarse invalida el listado para que se refresque sin recargar la página. El error
 * se expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useCrearCiclo() {
  const queryClient = useQueryClient();

  return useMutation<Ciclo, ApiError, CrearCiclo>({
    mutationFn: crearCiclo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesCiclos.listas() });
    },
  });
}
