"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { actualizarCompra } from "@/features/compras/api/compras";
import { clavesCompras } from "@/features/compras/query-keys";
import type { ActualizarCompra, Compra } from "@/features/compras/types";

/** Variables de la mutación de edición: identificador y campos a modificar. */
export type VariablesActualizarCompra = {
  id: string;
  datos: ActualizarCompra;
};

/**
 * Mutación de edición de una compra.
 *
 * Al completarse invalida el listado para que se refresque sin recargar la página. El error
 * se expone tipado como `ApiError` para que el formulario lo traduzca, incluido el `409` de
 * contrato con ventas registradas.
 */
export function useActualizarCompra() {
  const queryClient = useQueryClient();

  return useMutation<Compra, ApiError, VariablesActualizarCompra>({
    mutationFn: ({ id, datos }) => actualizarCompra(id, datos),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clavesCompras.listas() });
    },
  });
}
