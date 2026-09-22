"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api/errors";
import { listarTodosLosTerceros } from "@/features/terceros/api/terceros";
import { clavesTerceros } from "@/features/terceros/query-keys";
import type { Tercero } from "@/features/terceros/types";

/**
 * Consulta de todos los terceros del comerciante.
 *
 * Devuelve la colección completa en una única clave, para que `app/` resuelva los nombres
 * de los propietarios de fincas sin depender de la página visible del listado.
 */
export function useTodosLosTerceros() {
  return useQuery<Tercero[], ApiError>({
    queryKey: clavesTerceros.todos(),
    queryFn: listarTodosLosTerceros,
  });
}
