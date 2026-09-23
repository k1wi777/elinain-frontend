"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { crearCompra } from "@/features/compras/api/compras";
import { clavesCompras } from "@/features/compras/query-keys";
import type { Compra, CrearCompra } from "@/features/compras/types";

/**
 * Mutación de registro de una compra.
 *
 * Al completarse invalida el listado para que se refresque sin recargar la página. El error
 * se expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useCrearCompra() {
  const queryClient = useQueryClient();

  return useMutation<Compra, ApiError, CrearCompra>({
    mutationFn: crearCompra,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesCompras.listas() });
    },
  });
}
