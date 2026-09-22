"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { crearFinca } from "@/features/fincas/api/fincas";
import { clavesFincas } from "@/features/fincas/query-keys";
import type { CrearFinca, Finca } from "@/features/fincas/types";

/**
 * Mutación de creación de una finca.
 *
 * Al completarse invalida el listado y el mapa para que ambos se refresquen sin recargar
 * la página. El error se expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useCrearFinca() {
  const queryClient = useQueryClient();

  return useMutation<Finca, ApiError, CrearFinca>({
    mutationFn: crearFinca,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clavesFincas.listas() }),
        queryClient.invalidateQueries({ queryKey: clavesFincas.mapa() }),
      ]);
    },
  });
}
