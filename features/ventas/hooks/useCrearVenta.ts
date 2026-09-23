"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { crearVenta } from "@/features/ventas/api/ventas";
import { clavesVentas } from "@/features/ventas/query-keys";
import type { CrearVenta, Venta } from "@/features/ventas/types";

/**
 * Mutación de registro de una venta.
 *
 * Al completarse invalida el listado para que se refresque sin recargar la página. El error
 * se expone tipado como `ApiError` para que el formulario lo traduzca.
 */
export function useCrearVenta() {
  const queryClient = useQueryClient();

  return useMutation<Venta, ApiError, CrearVenta>({
    mutationFn: crearVenta,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesVentas.listas() });
    },
  });
}
