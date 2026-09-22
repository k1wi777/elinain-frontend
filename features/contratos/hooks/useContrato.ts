"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { obtenerContrato } from "@/features/contratos/api/contratos";
import { clavesContratos } from "@/features/contratos/query-keys";
import type { Contrato } from "@/features/contratos/types";

/**
 * Consulta del detalle de un contrato concreto.
 *
 * La consulta solo se habilita cuando hay un identificador, para no pedir un contrato
 * vacío al montar la vista de detalle o de edición.
 */
export function useContrato(id: string) {
  return useQuery<Contrato, ApiError>({
    queryKey: clavesContratos.detalle(id),
    queryFn: () => obtenerContrato(id),
    enabled: id !== "",
  });
}
