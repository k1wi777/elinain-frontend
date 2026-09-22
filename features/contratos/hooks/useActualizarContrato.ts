"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { actualizarContrato } from "@/features/contratos/api/contratos";
import { clavesContratos } from "@/features/contratos/query-keys";
import type { ActualizarContrato, Contrato } from "@/features/contratos/types";

/** Variables de la mutación de edición: identificador y campos a modificar. */
export type VariablesActualizarContrato = {
  id: string;
  datos: ActualizarContrato;
};

/**
 * Mutación de edición de un contrato.
 *
 * Al completarse invalida el listado y el detalle del contrato editado. El error se
 * expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useActualizarContrato() {
  const queryClient = useQueryClient();

  return useMutation<Contrato, ApiError, VariablesActualizarContrato>({
    mutationFn: ({ id, datos }) => actualizarContrato(id, datos),
    onSuccess: async (_contrato, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clavesContratos.lista() }),
        queryClient.invalidateQueries({
          queryKey: clavesContratos.detalle(id),
        }),
      ]);
    },
  });
}
