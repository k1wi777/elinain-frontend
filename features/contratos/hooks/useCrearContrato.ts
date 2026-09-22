"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { crearContrato } from "@/features/contratos/api/contratos";
import { clavesContratos } from "@/features/contratos/query-keys";
import type { Contrato, CrearContrato } from "@/features/contratos/types";

/**
 * Mutación de apertura de un contrato.
 *
 * Al completarse invalida el listado para que se refresque sin recargar la página. El
 * error se expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useCrearContrato() {
  const queryClient = useQueryClient();

  return useMutation<Contrato, ApiError, CrearContrato>({
    mutationFn: crearContrato,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: clavesContratos.lista(),
      });
    },
  });
}
