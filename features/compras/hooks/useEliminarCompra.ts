"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { eliminarCompra } from "@/features/compras/api/compras";
import { clavesCompras } from "@/features/compras/query-keys";

/**
 * Mutación de eliminación de una compra.
 *
 * Al completarse invalida el listado para que se actualice sin recargar la página. El error
 * se expone tipado como `ApiError` para que el modal lo traduzca, incluido el `409` de
 * contrato con ventas registradas.
 */
export function useEliminarCompra() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: eliminarCompra,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesCompras.listas() });
    },
  });
}
