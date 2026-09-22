"use client";

import {
  ContratoCrear,
  type FincaContrato,
  type TerceroContrato,
} from "@/features/contratos";
import { useTodasLasFincas } from "@/features/fincas";
import { useTodosLosTerceros } from "@/features/terceros";

/**
 * Composición del formulario de apertura con terceros y fincas.
 *
 * Carga los terceros y las fincas, los transforma a las proyecciones que espera
 * `features/contratos` y los pasa por props, sin que el feature conozca a los otros.
 */
export function NuevoConRelaciones() {
  const terceros = useTodosLosTerceros();
  const fincas = useTodasLasFincas();

  if (terceros.isPending || fincas.isPending) {
    return <p className="text-sm text-zinc-500">Cargando…</p>;
  }

  if (terceros.error || fincas.error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        No se pudieron cargar los socios de participación ni las fincas.
      </p>
    );
  }

  const tercerosContrato: TerceroContrato[] = (terceros.data ?? []).map(
    (tercero) => ({ id: tercero.id, nombre: tercero.nombre }),
  );
  const fincasContrato: FincaContrato[] = (fincas.data ?? []).map((finca) => ({
    id: finca.id,
    nombre: finca.nombre,
    tercero_id: finca.tercero_id,
  }));

  return <ContratoCrear terceros={tercerosContrato} fincas={fincasContrato} />;
}
