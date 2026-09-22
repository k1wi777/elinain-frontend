"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { listarTodosLosContratos } from "@/features/contratos/api/contratos";
import { clavesContratos } from "@/features/contratos/query-keys";
import type { Contrato } from "@/features/contratos/types";

/**
 * Consulta de todos los contratos del comerciante.
 *
 * Devuelve la colección completa en una única clave porque el backend no filtra por
 * estado: el listado filtra y pagina sobre este conjunto en el cliente.
 */
export function useContratos() {
  return useQuery<Contrato[], ApiError>({
    queryKey: clavesContratos.lista(),
    queryFn: listarTodosLosContratos,
  });
}
