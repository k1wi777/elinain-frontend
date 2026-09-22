"use client";

import {
  ContratosListado,
  type FincaContrato,
  type TerceroContrato,
} from "@/features/contratos";
import { useTodasLasFincas } from "@/features/fincas";
import { useTodosLosTerceros } from "@/features/terceros";

/**
 * Composición del listado de contratos con terceros y fincas.
 *
 * Carga los terceros y las fincas con los hooks de sus features, los transforma a las
 * proyecciones `TerceroContrato`/`FincaContrato` y las pasa por props a
 * `features/contratos`, de modo que el feature de contratos nunca importa de otros
 * features.
 */
export function ListadoConRelaciones() {
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

  return (
    <ContratosListado terceros={tercerosContrato} fincas={fincasContrato} />
  );
}
